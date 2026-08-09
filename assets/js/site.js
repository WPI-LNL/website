/*
	LNL Site JS
	Vanilla JS, no jQuery/Bootstrap. Handles: shared header/footer include,
	nav toggle, carousels, gallery lightbox, and the LNL API integration
	(system notifications, officers, office hours, sitemap redirects).
*/
(function () {
	"use strict";

	var API_BASE = "https://lnl.wpi.edu/api/v1/";

	var ICONS = {
		info: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 11.5h-1.5v-5h1.5v5zm0-6.5h-1.5V5.5h1.5V7z"/></svg>',
		warning: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.9 3.4a1 1 0 00-1.8 0l-7.8 13A1 1 0 002.2 18h15.6a1 1 0 00.86-1.6l-7.76-13zM10 8.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0110 8.25zm0 6.75a.9.9 0 110-1.8.9.9 0 010 1.8z"/></svg>',
		close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>',
		chevron: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 4.5l-6 5.5 6 5.5"/></svg>',
		check: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"/></svg>'
	};

	/* ---------------- Header / footer include ---------------- */
	function include(el, url) {
		if (!el) return Promise.resolve();
		return fetch(url)
			.then(function (r) { return r.text(); })
			.then(function (html) {
				el.innerHTML = html;
				el.dispatchEvent(new CustomEvent("lnl:loaded"));
			})
			.catch(function () {});
	}

	function markActiveNav() {
		var path = window.location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
		if (path.length > 1) path = path.replace(/\/$/, "");
		document.querySelectorAll(".site-nav a[href]").forEach(function (a) {
			var href = a.getAttribute("href").replace(/\/$/, "");
			if (href && (path === href || (href !== "" && path.indexOf(href) === 0 && href !== "/"))) {
				a.setAttribute("aria-current", "page");
			}
		});
	}

	function initHeader(headerEl) {
		var toggle = headerEl.querySelector(".nav-toggle");
		var nav = headerEl.querySelector(".site-nav");
		if (toggle && nav) {
			toggle.addEventListener("click", function () {
				var open = nav.getAttribute("data-open") === "true";
				nav.setAttribute("data-open", String(!open));
				toggle.setAttribute("aria-expanded", String(!open));
			});
			nav.querySelectorAll("a").forEach(function (a) {
				a.addEventListener("click", function () {
					nav.setAttribute("data-open", "false");
					toggle.setAttribute("aria-expanded", "false");
				});
			});
		}
		markActiveNav();
	}

	function initFooter(footerEl) {
		var yearEl = footerEl.querySelector("[data-year]");
		if (yearEl) yearEl.textContent = new Date().getFullYear();
	}

	/* ---------------- Carousels ---------------- */
	function initCarousels() {
		document.querySelectorAll(".carousel[data-carousel]").forEach(function (root) {
			var track = root.querySelector(".carousel-track");
			var slides = Array.prototype.slice.call(root.querySelectorAll(".carousel-slide"));
			if (!track || slides.length < 2) return;

			var dotsWrap = root.querySelector(".carousel-dots");
			var dots = [];
			if (dotsWrap) {
				slides.forEach(function (_, i) {
					var b = document.createElement("button");
					b.type = "button";
					b.setAttribute("aria-label", "Go to slide " + (i + 1));
					if (i === 0) b.setAttribute("aria-current", "true");
					b.addEventListener("click", function () { goTo(i); });
					dotsWrap.appendChild(b);
					dots.push(b);
				});
			}

			function currentIndex() {
				return Math.round(track.scrollLeft / track.clientWidth);
			}

			function goTo(i) {
				i = ((i % slides.length) + slides.length) % slides.length;
				track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
			}

			root.querySelectorAll(".carousel-nav--prev").forEach(function (btn) {
				btn.addEventListener("click", function () { goTo(currentIndex() - 1); });
			});
			root.querySelectorAll(".carousel-nav--next").forEach(function (btn) {
				btn.addEventListener("click", function () { goTo(currentIndex() + 1); });
			});

			var scrollTimer;
			track.addEventListener("scroll", function () {
				clearTimeout(scrollTimer);
				scrollTimer = setTimeout(function () {
					var i = currentIndex();
					dots.forEach(function (d, di) {
						if (di === i) d.setAttribute("aria-current", "true");
						else d.removeAttribute("aria-current");
					});
				}, 80);
			}, { passive: true });

			if (root.hasAttribute("data-autoplay")) {
				var delay = parseInt(root.getAttribute("data-autoplay"), 10) || 6000;
				var timer = setInterval(function () { goTo(currentIndex() + 1); }, delay);
				root.addEventListener("mouseenter", function () { clearInterval(timer); });
				root.addEventListener("touchstart", function () { clearInterval(timer); }, { passive: true });
			}
		});
	}

	/* ---------------- Gallery lightbox ---------------- */
	function initGalleryLightboxes() {
		document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
			var items = Array.prototype.slice.call(gallery.querySelectorAll("img"));
			if (!items.length) return;

			var lb = document.createElement("div");
			lb.className = "lightbox";
			lb.innerHTML =
				'<button class="lightbox-close" aria-label="Close">' + ICONS.close + "</button>" +
				'<button class="carousel-nav carousel-nav--prev" aria-label="Previous photo">' + ICONS.chevron + "</button>" +
				'<img alt="">' +
				'<button class="carousel-nav carousel-nav--next" aria-label="Next photo">' + ICONS.chevron + "</button>";
			document.body.appendChild(lb);
			var img = lb.querySelector("img");
			var idx = 0;

			function show(i) {
				idx = ((i % items.length) + items.length) % items.length;
				img.src = items[idx].currentSrc || items[idx].src;
				img.alt = items[idx].alt || "";
			}
			function open(i) {
				show(i);
				lb.setAttribute("data-open", "true");
				document.body.style.overflow = "hidden";
			}
			function close() {
				lb.setAttribute("data-open", "false");
				document.body.style.overflow = "";
			}

			items.forEach(function (im, i) {
				im.closest(".media").addEventListener("click", function () { open(i); });
			});
			lb.querySelector(".lightbox-close").addEventListener("click", close);
			lb.querySelector(".carousel-nav--prev").addEventListener("click", function () { show(idx - 1); });
			lb.querySelector(".carousel-nav--next").addEventListener("click", function () { show(idx + 1); });
			lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
			document.addEventListener("keydown", function (e) {
				if (lb.getAttribute("data-open") !== "true") return;
				if (e.key === "Escape") close();
				if (e.key === "ArrowLeft") show(idx - 1);
				if (e.key === "ArrowRight") show(idx + 1);
			});
		});
	}

	/* ---------------- Cookies ---------------- */
	function getCookie(name) {
		var decoded = decodeURIComponent(document.cookie);
		var parts = decoded.split(";");
		for (var i = 0; i < parts.length; i++) {
			var c = parts[i];
			while (c.charAt(0) === " ") c = c.substring(1);
			if (c.indexOf(name + "=") === 0) return c.substring(name.length + 1);
		}
		return "";
	}
	function setCookie(key, value, expires) {
		document.cookie = key + "=" + value + ";expires=" + expires.toUTCString() + ";path=/;";
	}

	/* ---------------- Notifications / system alerts ---------------- */
	var modalBackdrop, modalHead, modalTitle, modalBody, modalTone;

	function ensureModal() {
		if (modalBackdrop) return;
		modalBackdrop = document.getElementById("critical-alert");
		if (!modalBackdrop) {
			modalBackdrop = document.createElement("div");
			modalBackdrop.id = "critical-alert";
			modalBackdrop.className = "modal-backdrop";
			modalBackdrop.innerHTML =
				'<div class="modal" role="dialog" aria-modal="true" aria-labelledby="alert-title">' +
					'<div class="modal-head" data-modal-head>' +
						'<h3 data-modal-title id="alert-title"></h3>' +
						'<button class="modal-close" data-modal-close aria-label="Close">' + ICONS.close + "</button>" +
					"</div>" +
					'<div class="modal-body" data-modal-body></div>' +
					'<div class="modal-foot"><button class="btn btn--ghost btn--sm" data-modal-close>Close</button></div>' +
				"</div>";
			document.body.appendChild(modalBackdrop);
		}
		modalHead = modalBackdrop.querySelector("[data-modal-head]");
		modalTitle = modalBackdrop.querySelector("[data-modal-title]");
		modalBody = modalBackdrop.querySelector("[data-modal-body]");
		modalBackdrop.querySelectorAll("[data-modal-close]").forEach(function (btn) {
			btn.addEventListener("click", function () { modalBackdrop.setAttribute("data-open", "false"); });
		});
		modalBackdrop.addEventListener("click", function (e) {
			if (e.target === modalBackdrop) modalBackdrop.setAttribute("data-open", "false");
		});
	}

	function openModal(title, message, tone) {
		ensureModal();
		if (!modalBackdrop) return;
		modalTitle.textContent = title;
		modalBody.innerHTML = message;
		modalHead.setAttribute("data-tone", tone || "");
		modalBackdrop.setAttribute("data-open", "true");
	}

	window.lnlDismissAlert = function (id) {
		var expires = new Date();
		expires.setTime(expires.getTime() + 1000 * 60 * 60 * 24 * 365);
		setCookie(id, "UserSilenced", expires);
		if (modalBackdrop) modalBackdrop.setAttribute("data-open", "false");
	};

	function postNotification(item, alerts, notifs) {
		var title = item.title, message = item.message, type = item.type;
		var classType = item.class, expires = new Date(item.expires), id = item.id;
		if (new Date(expires) <= new Date()) return 0;

		if (item.format === "alert" && alerts === 0) {
			if ((getCookie(id) === "" || window.location.pathname === "/") && classType === 2) {
				setCookie(id, "AutoSilenced", expires);
				openModal(title, message, type);
				return 1;
			} else if (classType === 1) {
				openModal(title, message, type);
				return 1;
			} else if (getCookie(id) === "" && classType === 3) {
				var dismiss = '<br><br><span onclick="lnlDismissAlert(\'' + id + '\')" style="cursor:pointer;color:var(--lnl-yellow);font-size:0.85em;">Don’t show this again</span>';
				openModal(title, message + dismiss, type);
				return 1;
			}
		} else if (item.format === "notification" && notifs === 0) {
			var icon = type === "warning" ? ICONS.warning : ICONS.info;
			var toneClass = type === "advisory" ? "notice--advisory" : type === "warning" ? "notice--danger" : "notice--info";
			var html = '<div class="notice ' + toneClass + '">' + icon + "<span>" + message + "</span></div>";
			if (classType === 1) {
				var sysAlert = document.getElementById("system-alert");
				var sysSpacer = document.getElementById("system-spacer");
				if (sysAlert) sysAlert.innerHTML = html;
				if (sysSpacer) sysSpacer.innerHTML = html;
			} else {
				var alertEl = document.getElementById("alert");
				if (alertEl) {
					html = '<div class="notice ' + toneClass + '">' + icon + "<span>" + message + '</span><button class="notice-close" aria-label="Dismiss">' + ICONS.close + "</button></div>";
					alertEl.innerHTML = html;
					var closeBtn = alertEl.querySelector(".notice-close");
					if (closeBtn) closeBtn.addEventListener("click", function () { alertEl.innerHTML = ""; });
				}
				return 2;
			}
		}
		return 0;
	}

	function getNotifications() {
		var params = new URLSearchParams({
			project_id: "LNL",
			directory: window.location.pathname.split("/").slice(0, -1).join("/"),
			page_id: window.location.pathname
		});
		fetch(API_BASE + "notifications?" + params.toString())
			.then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
			.then(function (data) {
				data.sort(function (a, b) { return a["class"] < b["class"] ? -1 : a["class"] > b["class"] ? 1 : 0; });
				var alertMode = 0, notifMode = 0;
				data.forEach(function (item) {
					var mode = postNotification(item, alertMode, notifMode);
					if (mode === 1) alertMode = 1;
					else if (mode === 2) notifMode = 1;
				});
			})
			.catch(function () {});
	}

	/* ---------------- Officers ---------------- */
	function getOfficers(display) {
		fetch(API_BASE + "officers?options=img,class_year")
			.then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
			.then(function (data) {
				if (display) loadOfficerCards(data);
				else getOfficeHours(data);
			})
			.catch(function () {});
	}

	function loadOfficerCards(data) {
		document.querySelectorAll("[data-officer]").forEach(function (card) {
			var title = card.getAttribute("data-officer");
			var match = data.find(function (o) { return o.title === title; });
			if (!match) { card.classList.add("card--hidden"); return; }
			var nameEl = card.querySelector("[data-role=name]");
			var yearEl = card.querySelector("[data-role=year]");
			var photoEl = card.querySelector("[data-role=photo]");
			if (nameEl) nameEl.textContent = match.name;
			if (yearEl) yearEl.textContent = match.class_year ? "(" + match.class_year + ")" : "";
			if (photoEl && match.img) photoEl.src = match.img;
		});
	}

	/* ---------------- Office hours ---------------- */
	var OFFICER_EMAIL = {
		"President": "lnl-p@wpi.edu", "Interim President": "lnl-p@wpi.edu",
		"Vice President": "lnl-vp@wpi.edu", "Interim Vice President": "lnl-vp@wpi.edu",
		"Technical Director": "lnl-td@wpi.edu", "Interim Technical Director": "lnl-td@wpi.edu",
		"Head Projectionist": "lnl-hp@wpi.edu", "Interim Head Projectionist": "lnl-hp@wpi.edu",
		"Webmaster": "lnl-w@wpi.edu", "Interim Webmaster": "lnl-w@wpi.edu",
		"Treasurer": "lnl-t@wpi.edu", "Interim Treasurer": "lnl-t@wpi.edu",
		"Secretary": "lnl-s@wpi.edu", "Interim Secretary": "lnl-s@wpi.edu"
	};
	var OFFICER_POSITION = {
		"President": 0, "Interim President": 0, "Vice President": 1, "Interim Vice President": 1,
		"Technical Director": 2, "Interim Technical Director": 2,
		"Head Projectionist": 3, "Interim Head Projectionist": 3,
		"Treasurer": 4, "Interim Treasurer": 4, "Secretary": 5, "Interim Secretary": 5,
		"Webmaster": 6, "Interim Webmaster": 6
	};
	var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	function formatEvent(event) {
		var day = DAYS[parseInt(event.day, 10)];
		if (!day) return "";
		var hs = event.hour_start.split(":"), he = event.hour_end.split(":");
		var hStart = parseInt(hs[0], 10), hEnd = parseInt(he[0], 10);
		var pmStart = hStart >= 12 ? "PM" : "AM", pmEnd = hEnd >= 12 ? "PM" : "AM";
		if (hStart > 12) hStart -= 12;
		if (hEnd > 12) hEnd -= 12;
		return day + " from " + hStart + ":" + hs[1] + " " + pmStart + " to " + hEnd + ":" + he[1] + " " + pmEnd;
	}

	function getOfficeHours(officers) {
		var tbody = document.getElementById("hours");
		if (!tbody) return;
		fetch(API_BASE + "office-hours")
			.then(function (r) {
				if (!r.ok) throw r;
				return r.json();
			})
			.then(function (hours) { renderHours(officers, hours, tbody); })
			.catch(function () {
				tbody.innerHTML = '<tr><td colspan="5">' + ICONS.warning + " There are currently no office hours scheduled at this time</td></tr>";
			});
	}

	function renderHours(officers, hours, tbody) {
		var rows = {};
		officers.forEach(function (officer) {
			var title = officer.title;
			if (title === "Advisor") return;
			var email = OFFICER_EMAIL[title] || "Not available";
			var position = OFFICER_POSITION[title] !== undefined ? OFFICER_POSITION[title] : 7;
			var location = "Office";
			var times = [];
			var day = 8;
			hours.forEach(function (h, j) {
				if (h.officer === title) {
					if (j < day) day = j;
					times.push(formatEvent(h));
					if (h.location) location = h.location;
				}
			});
			if (!times.length) times.push("~ Not available ~");
			var emailCell = email !== "Not available" ? '<a href="mailto:' + email + '">' + email + "</a>" : email;
			var tr = "<tr><td>" + officer.name + "</td><td>" + title + "</td><td>" + location + "</td><td>" + times.join("<br>") + "</td><td>" + emailCell + "</td></tr>";
			rows[position + ":" + day] = tr;
			rows.__keys = rows.__keys || [];
			rows.__keys.push(position + ":" + day);
		});
		(rows.__keys || []).sort(function (a, b) {
			var pa = a.split(":").map(Number), pb = b.split(":").map(Number);
			return pa[0] - pb[0] || pa[1] - pb[1];
		}).forEach(function (key) { tbody.innerHTML += rows[key]; });
	}

	/* ---------------- Sitemap redirects ---------------- */
	function getRedirects() {
		var wrap = document.getElementById("more-links");
		if (!wrap) return;
		fetch(API_BASE + "sitemap")
			.then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
			.then(function (data) {
				var hasRedirects = false;
				data.forEach(function (item) {
					var list = document.getElementById(item.category);
					if (list) {
						list.innerHTML += '<li><a href="' + item.path + '">' + item.title + "</a></li>";
					} else {
						wrap.insertAdjacentHTML(
							"afterbegin",
							'<div><h3>' + item.category + '</h3><ul id="' + item.category + '"><li><a href="' + item.path + '">' + item.title + "</a></li></ul></div>"
						);
					}
					if (item.category === "Redirects") hasRedirects = true;
				});
				var extra = document.getElementById("additional-links");
				if (hasRedirects && extra) extra.style.display = "";
			})
			.catch(function () {});
	}

	/* ---------------- Boot ---------------- */
	window.lnl = { getNotifications: getNotifications, getOfficers: getOfficers, getRedirects: getRedirects };

	document.addEventListener("DOMContentLoaded", function () {
		var headerEl = document.getElementById("header");
		var footerEl = document.getElementById("footer");
		var tasks = [];
		if (headerEl) tasks.push(include(headerEl, "/assets/html/header.html").then(function () { initHeader(headerEl); }));
		if (footerEl) tasks.push(include(footerEl, "/assets/html/footer.html").then(function () { initFooter(footerEl); }));

		Promise.all(tasks).then(function () {
			ensureModal();
			var body = document.body;
			getNotifications();
			if (body.hasAttribute("data-officers")) getOfficers(true);
			if (body.hasAttribute("data-office-hours")) getOfficers(false);
			if (body.hasAttribute("data-redirects")) getRedirects();
		});

		initCarousels();
		initGalleryLightboxes();
	});
})();

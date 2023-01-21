import gsap from "gsap";

const init = () => {
  const ACTIVE_TAB = "w--current";

  let activeIndex = 0;
  let timeout;
  let tween;

  // Select the node that will be observed for mutations
  const tabsComponent = document.querySelector('[wb-data="tabs"]');
  if (!tabsComponent) return;

  const tabsMenu = tabsComponent.querySelector('[wb-data="menu"]');
  if (!tabsMenu) return;
  const tabsContent = tabsComponent.querySelector('[wb-data="content"]');
  if (!tabsContent) return;
  const videos = tabsContent.querySelectorAll("video");
  if (!videos) return;
  const loaders = tabsMenu.querySelectorAll(".loader");

  // fix for safari scrolling to tab on focus
  if (navigator.userAgent.includes("Safari")) {
    let tabLinks = tabsMenu.childNodes as NodeListOf<HTMLAnchorElement>;
    tabLinks.forEach(
      (tabLink) =>
        (tabLink.focus = function () {
          const x = window.scrollX,
            y = window.scrollY;
          const f = () => {
            setTimeout(() => window.scrollTo(x, y), 1);
            tabLink.removeEventListener("focus", f);
          };
          tabLink.addEventListener("focus", f);
          HTMLElement.prototype.focus.apply(this, arguments);
        })
    );
  }

  const animateLoader = (duration) => {
    tween = gsap.fromTo(
      loaders[activeIndex],
      { width: "0%" },
      { width: "100%", duration: duration, ease: "none" }
    );
  };

  const autoPlayTabs = () => {
    clearTimeout(timeout);

    const activeVideo = videos[activeIndex];
    console.log({ duration: activeVideo.duration });
    activeVideo.currentTime = 0;

    if (tween) {
      tween.progress(0);
      tween.kill();
    }

    if (loaders.length > 0) {
      animateLoader(activeVideo.duration);
    }

    timeout = setTimeout(() => {
      let nextIndex;
      if (activeIndex >= tabsMenu.childElementCount - 1) {
        nextIndex = 0;
      } else {
        nextIndex = activeIndex + 1;
      }
      const nextTab = tabsMenu.childNodes[nextIndex] as HTMLAnchorElement;

      nextTab.click();
    }, activeVideo.duration * 1000);
  };
  autoPlayTabs();

  // Options for the observer (which mutations to observe)
  const config = {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        const target = mutation.target;
        if (target.classList.contains(ACTIVE_TAB)) {
          activeIndex = parseInt(target.id.slice(-1), 10);
          console.log({ activeIndex });
          // auto play tabs
          autoPlayTabs();
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(tabsComponent, config);
};

window.addEventListener("load", init);

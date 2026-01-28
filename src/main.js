import "aframe";
import "./style.css";

// Fonction utilitaire pour interpoler entre deux couleurs hexadécimales
function interpolateColor(color1, color2, factor) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Fonction pour transition douce de couleur
function smoothColorTransition(
  element,
  targetColor,
  targetIntensity,
  duration = 3000,
) {
  const startColor = element.getAttribute("color");
  const startTime = Date.now();

  const animInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing smooth (ease-in-out)
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const currentColor = interpolateColor(startColor, targetColor, eased);
    element.setAttribute("color", currentColor);

    if (progress >= 1) {
      clearInterval(animInterval);
      element.setAttribute("color", targetColor);
    }
  }, 16); // ~60fps
}

// Gestion des cycles jour/nuit
let isDaytime = true;
const dome = document.querySelector("#dome");
const sun = document.querySelector("#sun");

function toggleDayNight() {
  isDaytime = !isDaytime;

  if (isDaytime) {
    smoothColorTransition(dome, "#87CEEB", 1, 5000); // 5 secondes de transition

    // Transition douce de l'intensité lumineuse
    let startIntensity = 0.3;
    let targetIntensity = 1;
    let startTime = Date.now();
    let duration = 5000;

    const lightInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const intensity =
        startIntensity + (targetIntensity - startIntensity) * eased;
      sun.setAttribute("light", "intensity", intensity);
      if (progress >= 1) clearInterval(lightInterval);
    }, 16);
  } else {
    smoothColorTransition(dome, "#191970", 0.3, 5000); // 5 secondes de transition

    // Transition douce de l'intensité lumineuse
    let startIntensity = 1;
    let targetIntensity = 0.3;
    let startTime = Date.now();
    let duration = 5000;

    const lightInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const intensity =
        startIntensity + (targetIntensity - startIntensity) * eased;
      sun.setAttribute("light", "intensity", intensity);
      if (progress >= 1) clearInterval(lightInterval);
    }, 16);
  }
}

// Cycle automatique jour/nuit toutes les 30 secondes
setInterval(toggleDayNight, 30000);

// Animation du coucher de soleil (golden hour)
let sunsetComplete = false;

function startSunsetAnimation() {
  const sun = document.querySelector("#sun");
  const dome = document.querySelector("#dome");

  // Couleurs de départ et d'arrivée
  const startSkyColor = "#1C1C3C"; // Bleu nuit
  const midSkyColor = "#6B4C9A"; // Violet intermédiaire
  const endSkyColor = "#FF8C42"; // Orange doré (golden hour)
  const startSunIntensity = 1;
  const endSunIntensity = 0.7;

  let progress = 0;
  const duration = 15000; // 15 secondes
  const startTime = Date.now();

  const animationInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    progress = Math.min(elapsed / duration, 1);

    // Easing smooth (ease-in-out)
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Interpolation douce de l'intensité du soleil
    const currentIntensity =
      startSunIntensity + (endSunIntensity - startSunIntensity) * eased;
    sun.setAttribute("light", "intensity", currentIntensity);

    // Interpolation fluide de la couleur du ciel (3 étapes)
    let currentColor;
    if (eased < 0.5) {
      // Première moitié : bleu nuit -> violet
      currentColor = interpolateColor(startSkyColor, midSkyColor, eased * 2);
    } else {
      // Deuxième moitié : violet -> orange doré
      currentColor = interpolateColor(
        midSkyColor,
        endSkyColor,
        (eased - 0.5) * 2,
      );
    }

    dome.setAttribute("color", currentColor);

    if (progress >= 1) {
      clearInterval(animationInterval);
      sunsetComplete = true;
      console.log("Coucher de soleil terminé - Golden hour atteinte");
      dome.setAttribute("color", endSkyColor);
    }
  }, 16); // ~60fps pour transition très fluide
}

// Gestion des transitions entre mondes
let currentWorld = 1;

function switchWorld(worldNumber) {
  // Cacher tous les mondes
  document.querySelector("#desert-world").setAttribute("visible", false);
  document.querySelector("#moon-world").setAttribute("visible", false);
  document.querySelector("#flower-world").setAttribute("visible", false);

  // Afficher le monde demandé
  switch (worldNumber) {
    case 1:
      document.querySelector("#desert-world").setAttribute("visible", true);
      dome.setAttribute("color", "#F4A460"); // Ambiance désert
      break;
    case 2:
      document.querySelector("#moon-world").setAttribute("visible", true);
      dome.setAttribute("color", "#1C1C3C"); // Ambiance lunaire
      break;
    case 3:
      document.querySelector("#flower-world").setAttribute("visible", true);
      // Téléporter au sommet de la sphère (rayon 15 + hauteur caméra)
      const cameraRig = document.querySelector("#camera-rig");
      cameraRig.setAttribute("position", "0 15.3 0");
      dome.setAttribute("color", "#87CEEB"); // Ambiance champ
      break;
  }

  currentWorld = worldNumber;
}

// Attendre que la scène soit chargée
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    // Interaction avec l'avion -> Téléportation sur la Lune
    const airplane = document.querySelector("#airplane");
    const cameraRig = document.querySelector("#camera-rig");
    const desertWorld = document.querySelector("#desert-world");
    const moonWorld = document.querySelector("#moon-world");

    if (airplane) {
      airplane.addEventListener("click", () => {
        console.log("Avion cliqué - Téléportation sur la Lune");

        // Cacher le désert
        desertWorld.setAttribute("visible", false);

        // Afficher la surface de la Lune
        moonWorld.setAttribute("visible", true);

        // Téléporter la caméra sur la Lune (sur le dessus de la sphère)
        cameraRig.setAttribute("position", "8 20.3 -10");

        // Lancer l'animation du coucher de soleil (golden hour)
        startSunsetAnimation();

        // Changer l'ambiance
        dome.setAttribute("color", "#1C1C3C");
      });
    }

    // Interaction avec la rose -> Champ de fleurs
    const rose = document.querySelector("#rose");
    if (rose) {
      rose.addEventListener("click", () => {
        if (!sunsetComplete) {
          console.log("Attendez la fin du coucher de soleil...");
          return;
        }
        console.log("Rose cliquée - Transition vers le Champ de fleurs");
        switchWorld(3);
      });
    }
  }, 1000);
});

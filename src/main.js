import "aframe";
import "./style.css";

// Gestion des sons
let windSound = null;
let mainOstSound = null;

// Écran de démarrage et initialisation du son
window.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const startScreen = document.getElementById("start-screen");
  const mainScene = document.getElementById("main-scene");

  startButton.addEventListener("click", () => {
    // Lancer le son du vent
    windSound = new Audio("./WindSFX.m4a");
    windSound.loop = true;
    windSound.volume = 0.5;
    windSound.play();

    // Précharger le son principal
    mainOstSound = new Audio("./MainOst.m4a");
    mainOstSound.loop = true;
    mainOstSound.volume = 0.6;

    // Masquer l'écran de démarrage et afficher la scène
    startScreen.style.display = "none";
    mainScene.style.display = "block";

    // Corriger les trous dans les modèles GLB (rendu double-face)
    setTimeout(() => {
      const scene = document.querySelector("a-scene");
      if (scene && scene.object3D) {
        scene.object3D.traverse((node) => {
          if (node.isMesh) {
            if (Array.isArray(node.material)) {
              node.material.forEach((mat) => {
                mat.side = THREE.DoubleSide;
              });
            } else if (node.material) {
              node.material.side = THREE.DoubleSide;
            }
          }
        });
      }
    }, 2000);
  });
});

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
let dayNightInterval = setInterval(toggleDayNight, 30000);

// Animation du coucher de soleil (golden hour)
let sunsetComplete = false;

function startSunsetAnimation() {
  const sun = document.querySelector("#sun");
  const dome = document.querySelector("#dome");

  // Couleurs de départ et d'arrivée - transition douce nuit vers aube
  const startSkyColor = "#1C1C3C"; // Bleu nuit
  const color1 = "#2A3A52"; // Bleu gris nuit
  const color2 = "#4A5A6A"; // Gris bleué
  const color3 = "#8A7A6A"; // Gris chaud
  const color4 = "#C8A882"; // Beige orangé
  const color5 = "#FFB870"; // Jaune doux
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

    // Interpolation fluide de la couleur du ciel - transition nuit vers aube dorée
    let currentColor;
    if (eased < 0.17) {
      // Bleu nuit -> Bleu gris
      currentColor = interpolateColor(startSkyColor, color1, eased / 0.17);
    } else if (eased < 0.33) {
      // Bleu gris -> Gris bleué
      currentColor = interpolateColor(color1, color2, (eased - 0.17) / 0.16);
    } else if (eased < 0.5) {
      // Gris bleué -> Gris chaud
      currentColor = interpolateColor(color2, color3, (eased - 0.33) / 0.17);
    } else if (eased < 0.67) {
      // Gris chaud -> Beige orangé
      currentColor = interpolateColor(color3, color4, (eased - 0.5) / 0.17);
    } else if (eased < 0.83) {
      // Beige orangé -> Jaune doux
      currentColor = interpolateColor(color4, color5, (eased - 0.67) / 0.16);
    } else {
      // Jaune doux -> Orange doré
      currentColor = interpolateColor(
        color5,
        endSkyColor,
        (eased - 0.83) / 0.17,
      );
    }

    dome.setAttribute("color", currentColor);

    if (progress >= 1) {
      clearInterval(animationInterval);
      sunsetComplete = true;
      console.log("Coucher de soleil terminé - Golden hour atteinte");
      dome.setAttribute("color", endSkyColor);

      // Jouer le son SFX_Activation
      const activationSound = new Audio("./SFX_Activation.mp3");
      activationSound.play();

      // Afficher et animer le texte poétique
      const roseText = document.querySelector("#rose-text");
      if (roseText) {
        // Apparition progressive
        let textOpacity = 0;
        const fadeInDuration = 2000;
        const fadeInStart = Date.now();

        const fadeInInterval = setInterval(() => {
          const elapsed = Date.now() - fadeInStart;
          textOpacity = Math.min(elapsed / fadeInDuration, 1);
          roseText.setAttribute("opacity", textOpacity);

          if (textOpacity >= 1) {
            clearInterval(fadeInInterval);

            // Disparition après 3 secondes
            setTimeout(() => {
              const fadeOutDuration = 2000;
              const fadeOutStart = Date.now();

              const fadeOutInterval = setInterval(() => {
                const elapsed = Date.now() - fadeOutStart;
                const progress = Math.min(elapsed / fadeOutDuration, 1);
                roseText.setAttribute("opacity", 1 - progress);

                if (progress >= 1) {
                  clearInterval(fadeOutInterval);
                }
              }, 16);
            }, 3000);
          }
        }, 16);
      }
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
    let airplaneClicked = false;

    if (airplane) {
      airplane.addEventListener("click", () => {
        if (airplaneClicked) return; // Éviter les clics multiples
        airplaneClicked = true;
        console.log("Avion cliqué - Téléportation sur la Lune");

        // Arrêter le cycle automatique jour/nuit
        if (dayNightInterval) {
          clearInterval(dayNightInterval);
          dayNightInterval = null;
        }

        // Cacher le désert
        desertWorld.setAttribute("visible", false);

        // Afficher la surface de la Lune
        moonWorld.setAttribute("visible", true);

        // Téléporter la caméra sur la Lune (sur le dessus de la sphère)
        cameraRig.setAttribute("position", "8 20.3 -10");

        // Arrêter le son du vent et lancer la musique principale
        if (windSound) {
          windSound.pause();
          windSound.currentTime = 0;
        }
        if (mainOstSound) {
          mainOstSound.play();
        }

        // Lancer l'animation du coucher de soleil (golden hour)
        // Le dôme sera géré par l'animation golden hour
        startSunsetAnimation();
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

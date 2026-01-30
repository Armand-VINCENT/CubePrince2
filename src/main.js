import "aframe";
import "./style.css";

// Composant personnalisé pour gérer les clics sur les modèles 3D (Web + VR)
AFRAME.registerComponent("cursor-listener", {
  init: function () {
    const element = this.el;
    let isProcessing = false;

    // Fonction commune pour tous les types de clics avec debounce
    const handleInteraction = (eventType) => {
      if (isProcessing) return; // Éviter les clics multiples
      isProcessing = true;

      console.log(`🎮 Interaction détectée via: ${eventType}`);
      element.emit("model-clicked", { source: eventType });

      // Réinitialiser après un court délai
      setTimeout(() => {
        isProcessing = false;
      }, 100);
    };

    // Événement principal pour Web (souris)
    element.addEventListener("click", () => handleInteraction("click"));

    // Événement principal pour VR (contrôleurs)
    element.addEventListener("triggerdown", () =>
      handleInteraction("triggerdown"),
    );

    console.log(
      `✨ Composant cursor-listener initialisé sur ${element.id || element.className}`,
    );
  },
});

// Gestion des sons
let windSound = null;
let mainOstSound = null;
let spaceSFX = null;
let airplaneSound = null;

// Timers pour transitions automatiques
let desertAutoTransitionTimer = null;
let moonAutoTransitionTimer = null;

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
    mainOstSound = new Audio("./StarsSong.m4a");
    mainOstSound.loop = false;
    mainOstSound.volume = 0.6;

    // Lancer SpaceSFX.mp3 quand StarsSong.m4a se termine
    mainOstSound.addEventListener("ended", () => {
      console.log("🎵 StarsSong terminé - Lancement de SpaceSFX");
      spaceSFX = new Audio("./SpaceSFX.mp3");
      spaceSFX.loop = true;
      spaceSFX.volume = 0.5;
      spaceSFX.play();

      // Transition du ciel vers le noir
      const dome = document.querySelector("#dome");
      const sun = document.querySelector("#sun");
      if (dome) {
        console.log("🌌 Transition du ciel vers le noir");
        smoothColorTransition(dome, "#000000", 0.1, 8000); // 8 secondes vers le noir

        // Réduire l'intensité du soleil progressivement
        if (sun) {
          let startTime = Date.now();
          let duration = 8000;
          let startIntensity =
            parseFloat(sun.getAttribute("light").intensity) || 0.7;
          let targetIntensity = 0.1;

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
    });

    // Masquer l'écran de démarrage et afficher la scène
    startScreen.style.display = "none";
    mainScene.style.display = "block";

    // Timer automatique : transition désert → lune après 20 secondes
    desertAutoTransitionTimer = setTimeout(() => {
      console.log(
        "⏰ Transition automatique désert → lune (20 secondes écoulées)",
      );
      // Déclencher la transition comme si l'avion était cliqué
      const airplaneClickEvent = new CustomEvent("model-clicked", {
        detail: { source: "auto-timer" },
      });
      const airplane = document.querySelector("#airplane");
      if (airplane) {
        airplane.dispatchEvent(airplaneClickEvent);
      }
    }, 20000);

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

    // Interaction avec le renard (cooldown de 3 secondes)
    let foxCooldown = false;
    const foxHitbox = document.querySelector("#fox .clickable");
    if (foxHitbox) {
      foxHitbox.addEventListener("click", () => {
        if (!foxCooldown) {
          // Jouer le son du renard en parallèle de la musique
          const foxSound = new Audio("./Foxsfx.mp3");
          foxSound.volume = 1; // Volume légèrement réduit pour ne pas couvrir la musique
          foxSound.play();
          console.log("🦊 Son du renard joué");

          // Activer le cooldown
          foxCooldown = true;
          setTimeout(() => {
            foxCooldown = false;
            console.log("✅ Renard prêt à être cliqué à nouveau");
          }, 3000);
        } else {
          console.log(
            "⏳ Cooldown actif - attendez avant de cliquer sur le renard",
          );
        }
      });
    }
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
let airplaneComplete = false;

function startSunsetAnimation() {
  const sun = document.querySelector("#sun");
  const dome = document.querySelector("#dome");

  // Couleurs de départ et d'arrivée - transition simplifiée (3 étapes au lieu de 7 pour meilleures performances)
  const startSkyColor = "#1C1C3C"; // Bleu nuit
  const midColor = "#7A6A72"; // Gris violet (mélange des couleurs intermédiaires)
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

    // Interpolation simplifiée de la couleur du ciel - 3 étapes (optimisé)
    let currentColor;
    if (eased < 0.5) {
      // Bleu nuit -> Gris violet
      currentColor = interpolateColor(startSkyColor, midColor, eased / 0.5);
    } else {
      // Gris violet -> Orange doré
      currentColor = interpolateColor(
        midColor,
        endSkyColor,
        (eased - 0.5) / 0.5,
      );
    }

    dome.setAttribute("color", currentColor);

    if (progress >= 1) {
      clearInterval(animationInterval); // Arrêter l'animation principale
      sunsetComplete = true;
      console.log("Coucher de soleil terminé - Golden hour atteinte");
      dome.setAttribute("color", endSkyColor);

      // Jouer le son SFX_Activation
      const activationSound = new Audio("./Magical_SFX.m4a");
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
              }, 50); // Réduit à ~20fps
            }, 3000);
          }
        }, 50); // Réduit à ~20fps
      }
    }
  }, 33); // ~30fps pour réduire la charge (au lieu de 60fps)
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
      dome.setAttribute("color", "#4979a7"); // Ambiance champ

      // Démarrer l'animation des ballons
      const balloons = document.querySelector("#balloons");
      if (balloons) {
        // Animation vers la gauche sans boucle
        balloons.setAttribute("animation", {
          property: "position",
          to: "-20 18 -8",
          dur: 30000,
          easing: "linear",
          loop: false,
        });
        console.log("🎈 Ballons animés dans le monde Fleurs");
      }
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
      console.log("✈️ Avion détecté dans la scène");

      // Écouter à la fois les événements click et model-clicked
      const handleAirplaneClick = (event) => {
        const eventType = event?.type || event?.detail?.source || "inconnu";
        console.log(`🖱️ CLIC DÉTECTÉ SUR L'AVION! (Type: ${eventType})`);
        if (airplaneClicked) {
          console.log("⚠️ Avion déjà cliqué - Événement ignoré");
          return; // Éviter les clics multiples
        }
        airplaneClicked = true;
        console.log("✅ Avion cliqué - Téléportation sur la Lune");

        // Annuler le timer automatique désert→lune si interaction manuelle
        if (desertAutoTransitionTimer) {
          clearTimeout(desertAutoTransitionTimer);
          desertAutoTransitionTimer = null;
          console.log(
            "⏰ Timer automatique désert→lune annulé (interaction manuelle)",
          );
        }

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

          // Faire apparaître les étoiles progressivement pendant StarsSong
          const stars = document.querySelectorAll(
            "#moon-world a-entity[position]",
          );
          const starCount = stars.length;
          const songDuration = 27000; // Durée de StarsSong en ms (27 secondes)
          const totalAppearanceDuration = 35000; // Les étoiles continuent d'apparaître après la musique (35 secondes)

          console.log(
            `⭐ ${starCount} étoiles vont apparaître progressivement sur ${totalAppearanceDuration / 1000}s`,
          );

          // Cacher toutes les étoiles au début
          stars.forEach((star) => {
            const sphere = star.querySelector("a-sphere");
            const light = star.querySelector("a-light[type='point']");
            if (sphere) sphere.setAttribute("visible", false);
            if (light) light.setAttribute("visible", false);
          });

          // Faire apparaître les étoiles progressivement avec un seul intervalle (optimisé)
          let currentStarIndex = 0;
          const starsPerUpdate = 2; // Apparaître 2 étoiles à la fois pour fluidité
          const updateInterval =
            (totalAppearanceDuration / starCount) * starsPerUpdate;

          const starInterval = setInterval(() => {
            for (
              let i = 0;
              i < starsPerUpdate && currentStarIndex < starCount;
              i++
            ) {
              const star = stars[currentStarIndex];
              const sphere = star.querySelector("a-sphere");
              const light = star.querySelector("a-light[type='point']");
              if (sphere) sphere.setAttribute("visible", true);
              if (light) light.setAttribute("visible", true);
              currentStarIndex++;
            }

            if (currentStarIndex >= starCount) {
              clearInterval(starInterval);
              console.log("✅ Toutes les étoiles sont apparues");
            }
          }, updateInterval);
        }

        // Lancer l'animation du coucher de soleil (golden hour)
        // Le dôme sera géré par l'animation golden hour
        startSunsetAnimation();

        // Faire passer l'avion dans le ciel après 50 secondes
        setTimeout(() => {
          const flyingAirplane = document.querySelector("#flying-airplane");
          const blinkLight = document.querySelector("#airplane-blink-light");

          if (flyingAirplane) {
            console.log("✈️ Avion volant apparaît dans le ciel");

            // Rendre l'avion visible
            flyingAirplane.setAttribute("visible", true);

            // Animation de traversée du ciel (plus loin)
            flyingAirplane.setAttribute("animation", {
              property: "position",
              to: "-35 10 0",
              dur: 20000,
              easing: "linear",
            });

            // Jouer le son de l'avion avec volume dynamique basé sur la distance
            airplaneSound = new Audio("./SFXAirplane.m4a");
            airplaneSound.loop = true;
            airplaneSound.volume = 0.3; // Volume initial
            airplaneSound.play();

            // Mettre à jour le volume en fonction de la distance par rapport à la rose
            const rose = document.querySelector("#rose");
            const rosePosition = rose.getAttribute("position");

            const updateAirplaneVolume = setInterval(() => {
              const airplanePosition = flyingAirplane.getAttribute("position");

              // Calculer la distance entre l'avion et la rose
              const dx = airplanePosition.x - rosePosition.x;
              const dy = airplanePosition.y - rosePosition.y;
              const dz = airplanePosition.z - rosePosition.z;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

              // Volume inversement proportionnel à la distance (plus proche = plus fort)
              // Distance minimale ~4.7 unités (au plus proche), maximale ~35 unités (limites du ciel)
              const minDistance = 4.7;
              const maxDistance = 35;
              const normalizedDistance = Math.min(
                Math.max(distance, minDistance),
                maxDistance,
              );
              const volume =
                1 -
                (normalizedDistance - minDistance) /
                  (maxDistance - minDistance);

              // Appliquer le volume (entre 0.2 et 1)
              airplaneSound.volume = 0.2 + volume * 0.8;

              console.log(
                `✈️ Distance: ${distance.toFixed(1)}, Volume: ${airplaneSound.volume.toFixed(2)}`,
              );
            }, 100); // Mise à jour toutes les 100ms

            // Arrêter le son et les mises à jour après l'animation (20 secondes)
            setTimeout(() => {
              clearInterval(updateAirplaneVolume);
              if (airplaneSound) {
                airplaneSound.pause();
                airplaneSound.currentTime = 0;
              }
              console.log("✈️ Son de l'avion arrêté");

              // Timer automatique : transition lune → fleurs 5 secondes après disparition avion
              moonAutoTransitionTimer = setTimeout(() => {
                console.log(
                  "⏰ Transition automatique lune → fleurs (5 secondes après avion)",
                );
                // Déclencher la transition comme si la rose était cliquée
                const roseClickEvent = new CustomEvent("model-clicked", {
                  detail: { source: "auto-timer" },
                });
                const rose = document.querySelector("#rose");
                if (rose) {
                  rose.dispatchEvent(roseClickEvent);
                }
              }, 5000);
            }, 20000);

            // Activer l'interaction avec la rose quand l'avion sort du ciel
            setTimeout(() => {
              airplaneComplete = true;
              console.log("✅ Avion sorti du ciel - Rose activable");

              // Afficher le texte "La rose..."
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
            }, 20000);

            // Animation de la lumière clignotante
            if (blinkLight) {
              blinkLight.setAttribute("animation", {
                property: "light.intensity",
                from: 0,
                to: 3,
                dir: "alternate",
                loop: true,
                dur: 500,
                easing: "linear",
              });
            }
          }
        }, 50000); // 50 secondes
      };

      // Utiliser uniquement l'événement personnalisé émis par cursor-listener
      airplane.addEventListener("model-clicked", handleAirplaneClick);

      console.log("🎯 Événement de clic enregistré sur l'avion (Web + VR)");
    } else {
      console.error("❌ Avion non trouvé dans la scène!");
    }

    // Interaction avec la rose -> Champ de fleurs
    const rose = document.querySelector("#rose");
    if (rose) {
      console.log("🌹 Rose détectée dans la scène");

      const handleRoseClick = (event) => {
        const eventType = event?.type || event?.detail?.source || "inconnu";
        console.log(`🖱️ CLIC DÉTECTÉ SUR LA ROSE! (Type: ${eventType})`);

        if (!airplaneComplete) {
          console.log("⏳ Attendez que l'avion sorte du ciel...");
          return;
        }
        console.log("✅ Rose cliquée - Transition vers le Champ de fleurs");

        // Annuler le timer automatique lune→fleurs si interaction manuelle
        if (moonAutoTransitionTimer) {
          clearTimeout(moonAutoTransitionTimer);
          moonAutoTransitionTimer = null;
          console.log(
            "⏰ Timer automatique lune→fleurs annulé (interaction manuelle)",
          );
        }

        // Arrêter SpaceSFX et lancer FlowerOST.mp3
        if (spaceSFX) {
          spaceSFX.pause();
          spaceSFX.currentTime = 0;
        }

        const flowerOST = new Audio("./FlowerOST.mp3");
        flowerOST.loop = true;
        flowerOST.volume = 0.6;
        flowerOST.play();
        console.log("🎵 Musique changée pour FlowerOST.mp3");

        switchWorld(3);
      };

      // Utiliser uniquement l'événement personnalisé émis par cursor-listener
      rose.addEventListener("model-clicked", handleRoseClick);

      console.log("🎯 Événement de clic enregistré sur la rose (Web + VR)");
    } else {
      console.error("❌ Rose non trouvée dans la scène!");
    }
  }, 1000);
});

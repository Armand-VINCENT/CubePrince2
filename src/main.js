import "aframe";
import "./style.css";

// Gestion des cycles jour/nuit
let isDaytime = true;
const dome = document.querySelector("#dome");
const sun = document.querySelector("#sun");

function toggleDayNight() {
  isDaytime = !isDaytime;

  if (isDaytime) {
    dome.setAttribute("color", "#87CEEB"); // Bleu ciel
    sun.setAttribute("light", "intensity", 1);
  } else {
    dome.setAttribute("color", "#191970"); // Bleu nuit
    sun.setAttribute("light", "intensity", 0.3);
  }
}

// Cycle automatique jour/nuit toutes les 30 secondes
setInterval(toggleDayNight, 30000);

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
    const moon = document.querySelector("#moon");
    const moonSurface = document.querySelector("#moon-surface");
    const desertWorld = document.querySelector("#desert-world");

    if (airplane) {
      airplane.addEventListener("click", () => {
        console.log("Avion cliqué - Téléportation sur la Lune");

        // Cacher le désert
        desertWorld.setAttribute("visible", false);

        // Afficher la surface de la Lune
        moonSurface.setAttribute("visible", true);

        // Téléporter la caméra sur la surface de la Lune
        const moonPosition = moon.getAttribute("position");
        cameraRig.setAttribute("position", {
          x: moonPosition.x,
          y: moonPosition.y + 2 + 1.6, // +2 pour la surface, +1.6 hauteur de la caméra
          z: moonPosition.z,
        });

        // Changer l'ambiance
        dome.setAttribute("color", "#1C1C3C");
      });
    }

    // Interaction avec la rose -> Champ de fleurs
    const rose = document.querySelector("#rose");
    if (rose) {
      rose.addEventListener("click", () => {
        console.log("Rose cliquée - Transition vers le Champ de fleurs");
        switchWorld(3);
      });
    }
  }, 1000);
});

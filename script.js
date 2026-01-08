const form = document.getElementById("applicationForm");
const steps = Array.from(document.querySelectorAll(".form-step"));
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const sectionLabel = document.getElementById("sectionLabel");
const progressDots = Array.from(document.querySelectorAll(".progress-dot"));
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const confirmation = document.getElementById("confirmation");
const storageKey = "collectiveApplicationState";

const sectionNames = [
  "Brand Information",
  "Brand Identity & Alignment",
  "Products & Showcase",
  "Participation & Logistics",
  "Package Selection",
  "Promotion & Content",
  "Final Confirmation",
];

let currentStep = 0;

const updateProgress = () => {
  const stepNumber = currentStep + 1;
  progressLabel.textContent = `Step ${stepNumber} of ${steps.length}`;
  sectionLabel.textContent = sectionNames[currentStep];
  progressFill.style.width = `${(stepNumber / steps.length) * 100}%`;
  progressDots.forEach((dot, index) => {
    dot.classList.toggle("active", index <= currentStep);
  });

  backBtn.disabled = currentStep === 0;
  nextBtn.hidden = currentStep === steps.length - 1;
  submitBtn.hidden = currentStep !== steps.length - 1;
};

const showStep = (index) => {
  steps.forEach((step, i) => {
    step.hidden = i !== index;
  });
  currentStep = index;
  updateProgress();
};

const clearErrors = (stepEl) => {
  stepEl.querySelectorAll("[data-error-for]").forEach((el) => {
    el.textContent = "";
  });
};

const validateStep = (stepEl) => {
  clearErrors(stepEl);
  return true;
};

const saveState = () => {
  const data = new FormData(form);
  const payload = {};
  data.forEach((value, key) => {
    if (payload[key]) {
      if (Array.isArray(payload[key])) {
        payload[key].push(value);
      } else {
        payload[key] = [payload[key], value];
      }
    } else {
      payload[key] = value;
    }
  });
  payload.currentStep = currentStep;
  localStorage.setItem(storageKey, JSON.stringify(payload));
};

const restoreState = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  const data = JSON.parse(saved);
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;

    if (field instanceof RadioNodeList) {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          const node = form.querySelector(`[name="${key}"][value="${val}"]`);
          if (node) node.checked = true;
        });
      } else {
        const node = form.querySelector(`[name="${key}"][value="${value}"]`);
        if (node) node.checked = true;
      }
    } else if (field.type === "checkbox") {
      field.checked = value === "on" || value === true;
    } else {
      field.value = value;
    }
  });

  if (typeof data.currentStep === "number") {
    showStep(Math.min(data.currentStep, steps.length - 1));
  }

  toggleOtherFields();
  updateCounters();
};

const toggleOtherFields = () => {
  const categoryOther = document.getElementById("brandCategoryOther");
  const categoryOtherText = document.getElementById("brandCategoryOtherText");
  categoryOtherText.hidden = !categoryOther.checked;

  const requirementsOther = document.getElementById("requirementsOther");
  const requirementsOtherText = document.getElementById("requirementsOtherText");
  if (requirementsOther && requirementsOtherText) {
    requirementsOtherText.hidden = !requirementsOther.checked;
  }
};

const toggleWebsiteFields = () => {
  const websiteWrap = document.getElementById("websiteInputWrap");
  const instagramWrap = document.getElementById("instagramInputWrap");
  const selection = form.querySelector("input[name='websiteType']:checked");
  const choice = selection ? selection.value : "website";
  websiteWrap.hidden = choice !== "website";
  instagramWrap.hidden = choice !== "instagram";
};

const updateCounters = () => {
  document.querySelectorAll("textarea[maxlength]").forEach((area) => {
    const counter = document.querySelector(`[data-counter-for="${area.id}"]`);
    if (!counter) return;
    const target = area.getAttribute("maxlength");
    counter.textContent = `${area.value.length} / ${target}`;
  });
};

backBtn.addEventListener("click", () => {
  showStep(Math.max(0, currentStep - 1));
});

nextBtn.addEventListener("click", () => {
  const stepEl = steps[currentStep];
  validateStep(stepEl);
  showStep(Math.min(steps.length - 1, currentStep + 1));
});

form.addEventListener("input", (event) => {
  if (event.target.matches("textarea[maxlength]")) {
    updateCounters();
  }
  saveState();
});

form.addEventListener("change", (event) => {
  if (event.target.id === "brandCategoryOther" || event.target.id === "requirementsOther") {
    toggleOtherFields();
  }
  if (event.target.name === "websiteType") {
    toggleWebsiteFields();
  }
  saveState();
});

const normalizeInstagramHandle = () => {
  const instagramField = document.getElementById("brandInstagram");
  if (!instagramField) return;
  const value = instagramField.value.trim();
  if (!value) return;
  if (!value.startsWith("@")) {
    instagramField.value = `@${value.replace(/^@+/, "")}`;
  }
};

const instagramField = document.getElementById("brandInstagram");
if (instagramField) {
  instagramField.addEventListener("blur", () => {
    normalizeInstagramHandle();
    saveState();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  setTimeout(() => {
    form.hidden = true;
    confirmation.hidden = false;
    localStorage.removeItem(storageKey);
  }, 900);
});

updateCounters();
restoreState();
toggleWebsiteFields();
showStep(currentStep);

const form = document.getElementById("applicationForm");
const steps = Array.from(document.querySelectorAll(".form-step"));
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const sectionLabel = document.getElementById("sectionLabel");
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

const setError = (fieldName, message) => {
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorEl) {
    errorEl.textContent = message;
  }
};

const clearErrors = (stepEl) => {
  stepEl.querySelectorAll("[data-error-for]").forEach((el) => {
    el.textContent = "";
  });
};

const isValidUrl = (value) => {
  try {
    const withScheme = value.startsWith("http") ? value : `https://${value}`;
    const url = new URL(withScheme);
    return Boolean(url.hostname.includes("."));
  } catch (error) {
    return false;
  }
};

const validateStep = (stepEl) => {
  clearErrors(stepEl);
  let valid = true;

  if (stepEl.dataset.step === "1") {
    const brandName = form.brandName.value.trim();
    if (brandName.length < 2) {
      setError("brandName", "Brand name must be at least 2 characters.");
      valid = false;
    }

    const website = form.websiteOrInstagram.value.trim();
    if (!website) {
      setError("websiteOrInstagram", "Please provide a website or Instagram handle.");
      valid = false;
    } else if (!(website.startsWith("@") || isValidUrl(website) || website.includes("instagram.com"))) {
      setError("websiteOrInstagram", "Enter a valid URL or Instagram handle.");
      valid = false;
    }

    const year = form.yearEstablished.value.trim();
    if (year && !/^\d{4}$/.test(year)) {
      setError("yearEstablished", "Enter a 4-digit year.");
      valid = false;
    }

    const email = form.contactEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("contactEmail", "Enter a valid email address.");
      valid = false;
    }
  }

  if (stepEl.dataset.step === "2") {
    const description = form.brandDescription.value.trim();
    const distinct = form.brandDistinct.value.trim();
    const why = form.brandWhy.value.trim();

    if (!description) {
      setError("brandDescription", "Please add a brief brand description.");
      valid = false;
    }
    if (!distinct) {
      setError("brandDistinct", "Please share what makes your brand distinct.");
      valid = false;
    }
    if (!why) {
      setError("brandWhy", "Please share why you want to join the collective.");
      valid = false;
    }
  }

  if (stepEl.dataset.step === "3") {
    if (!form.productsShowcase.value.trim()) {
      setError("productsShowcase", "Please list the products to be showcased.");
      valid = false;
    }
    if (!form.priceRange.value.trim()) {
      setError("priceRange", "Please provide an average price range.");
      valid = false;
    }
    if (!form.skuCount.value.trim()) {
      setError("skuCount", "Please estimate your SKU count.");
      valid = false;
    }
  }

  if (stepEl.dataset.step === "4") {
    const attendance = form.querySelector("input[name='attendance']:checked");
    if (!attendance) {
      setError("attendance", "Please select your attendance preference.");
      valid = false;
    }
  }

  if (stepEl.dataset.step === "5") {
    const packageType = form.querySelector("input[name='packageType']:checked");
    if (!packageType) {
      setError("packageType", "Please select a package type.");
      valid = false;
    }
  }

  if (stepEl.dataset.step === "6") {
    const preEvent = form.querySelector("input[name='preEventFeature']:checked");
    if (!preEvent) {
      setError("preEventFeature", "Please select yes or no.");
      valid = false;
    }

    const instagram = form.brandInstagram.value.trim();
    if (!instagram) {
      setError("brandInstagram", "Please provide your Instagram handle.");
      valid = false;
    } else if (!instagram.startsWith("@")) {
      setError("brandInstagram", "Instagram handle should start with @.");
      valid = false;
    }
  }

  if (stepEl.dataset.step === "7") {
    if (!form.acknowledgement.checked) {
      setError("acknowledgement", "You must acknowledge this to submit.");
      valid = false;
    }
  }

  return valid;
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
  requirementsOtherText.hidden = !requirementsOther.checked;
};

const updateCounters = () => {
  document.querySelectorAll("textarea[maxlength]").forEach((area) => {
    const counter = document.querySelector(`[data-counter-for="${area.id}"]`);
    if (!counter) return;
    const target = area.getAttribute("maxlength");
    counter.textContent = `${area.value.length} / ${target}`;
  });
};

const normalizeInstagram = (input) => {
  const value = input.value.trim();
  if (!value) return;
  if (!value.startsWith("@")) {
    input.value = `@${value.replace(/^@+/, "")}`;
  }
};

backBtn.addEventListener("click", () => {
  showStep(Math.max(0, currentStep - 1));
});

nextBtn.addEventListener("click", () => {
  const stepEl = steps[currentStep];
  if (validateStep(stepEl)) {
    showStep(Math.min(steps.length - 1, currentStep + 1));
  }
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
  saveState();
});

form.brandInstagram.addEventListener("blur", () => {
  normalizeInstagram(form.brandInstagram);
  saveState();
});

form.websiteOrInstagram.addEventListener("blur", () => {
  const value = form.websiteOrInstagram.value.trim();
  if (value.startsWith("@")) {
    saveState();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let firstInvalidIndex = -1;
  steps.forEach((step, index) => {
    const isValid = validateStep(step);
    if (!isValid && firstInvalidIndex === -1) {
      firstInvalidIndex = index;
    }
  });
  if (firstInvalidIndex !== -1) {
    showStep(firstInvalidIndex);
    return;
  }

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
showStep(currentStep);

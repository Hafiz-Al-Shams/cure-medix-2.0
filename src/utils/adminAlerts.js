// 📁 PATH: src/utils/adminAlerts.js  (NEW file)
// Theme-synced SweetAlert2 modals (styles live in src/index.css → ".cm-swal-*").
// They follow the light / dark mode automatically.
import Swal from "sweetalert2";

const base = {
    buttonsStyling: false,
    reverseButtons: true, // Cancel on the left, main action on the right
    customClass: {
        popup: "cm-swal-popup",
        title: "cm-swal-title",
        htmlContainer: "cm-swal-text",
        actions: "cm-swal-actions",
        confirmButton: "cm-swal-confirm",
        cancelButton: "cm-swal-cancel",
    },
};

// Confirmation modal → resolves to true only if the admin confirms
export const confirmAction = async ({ title, text, confirmText = "Yes, continue", danger = false }) => {
    const result = await Swal.fire({
        ...base,
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Cancel",
        customClass: { ...base.customClass, confirmButton: `cm-swal-confirm ${danger ? "cm-swal-danger" : ""}` },
    });
    return result.isConfirmed;
};

// Success modal (auto closes)
export const successAlert = (title, text) =>
    Swal.fire({ ...base, icon: "success", title, text, showConfirmButton: false, timer: 1800, timerProgressBar: true });

// Error modal
export const errorAlert = (title, text) =>
    Swal.fire({ ...base, icon: "error", title, text, confirmButtonText: "Got it" });

// Info modal
export const infoAlert = (title, text) =>
    Swal.fire({ ...base, icon: "info", title, text, confirmButtonText: "OK" });
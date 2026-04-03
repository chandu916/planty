export type FormFeedbackSound = "auth" | "default" | "error";

type FormFeedbackDetail = {
  sound: FormFeedbackSound;
  haptic?: boolean;
};

const FORM_FEEDBACK_EVENT = "planty:form-feedback";

export function triggerFormFeedback(detail: FormFeedbackDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FormFeedbackDetail>(FORM_FEEDBACK_EVENT, { detail }));
}

export { FORM_FEEDBACK_EVENT };
"use client";

import {
  FormEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const CUSTOM_TEMPLATE_STORAGE_KEY = "bettermailer.custom-templates";

const BUILT_IN_TEMPLATES = {
  apology: {
    label: "Apology",
    subject: "Apology for the inconvenience",
    body:
      "Dear [Recipient Name],\n\nI sincerely apologize for the inconvenience caused. I take full responsibility for the situation and regret any trouble this may have caused.\n\nI assure you that necessary steps are being taken to avoid such issues in the future.\n\nThank you for your understanding.\n\nSincerely,\n[Your Name]",
  },
  meetingRequest: {
    label: "Meeting Request",
    subject: "Request for a meeting",
    body:
      "Dear [Recipient Name],\n\nI hope this message finds you well.\n\nI would like to request a meeting to discuss [topic]. Please let me know a convenient time for you.\n\nLooking forward to your response.\n\nBest regards,\n[Your Name]",
  },
  followUp: {
    label: "Follow-up",
    subject: "Following up on my previous email",
    body:
      "Dear [Recipient Name],\n\nI hope you are doing well.\n\nI am writing to follow up on my previous email regarding [topic]. I would appreciate any update when convenient.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]",
  },
  thankYou: {
    label: "Thank You",
    subject: "Thank you for your support",
    body:
      "Dear [Recipient Name],\n\nI would like to sincerely thank you for your support and assistance. Your help has been greatly appreciated.\n\nIt was a pleasure working with you, and I value your time and effort.\n\nThank you once again.\n\nWarm regards,\n[Your Name]",
  },
  leaveRequest: {
    label: "Leave Request",
    subject: "Leave request for [dates]",
    body:
      "Dear [Recipient Name],\n\nI hope you are doing well.\n\nI am writing to request leave from [start date] to [end date] due to [reason].\n\nI will ensure that my responsibilities are managed before my absence and will be available for any handover needed.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]",
  },
} as const;

const FOOTER_ACTIONS = [
  {
    label: "Add attachment",
    path: "M8.5 3.5v7a2.5 2.5 0 1 1-5 0v-6a4 4 0 0 1 8 0v6.5a1.5 1.5 0 0 1-3 0v-6",
  },
  {
    label: "Insert emoji",
    path: "M5.25 6.25h.01M10.75 6.25h.01M5.5 10a3.5 3.5 0 0 0 5 0M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z",
  },
  {
    label: "Insert link",
    path: "M6 10l-1 1a2.121 2.121 0 0 1-3-3l2-2a2.121 2.121 0 0 1 3 0M10 6l1-1a2.121 2.121 0 1 1 3 3l-2 2a2.121 2.121 0 0 1-3 0M6.5 9.5l3-3",
  },
] as const;

type BuiltInTemplateKey = keyof typeof BUILT_IN_TEMPLATES;
type ComposeState = "closed" | "open" | "minimized";

interface CustomTemplate {
  id: string;
  label: string;
  prompt: string;
}

interface TemplateDefinition {
  label: string;
  subject: string;
  body: string;
}

const INITIAL_DRAFT = {
  to: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "",
};

const INITIAL_CUSTOM_TEMPLATE_FORM = {
  label: "",
  prompt: "",
};

function buildCustomTemplateDefinition(
  customTemplate: CustomTemplate,
): TemplateDefinition {
  return {
    label: customTemplate.label,
    subject: customTemplate.label,
    body: `Dear [Recipient Name],\n\n${customTemplate.prompt}\n\nPlease let me know if you need any additional details.\n\nBest regards,\n[Your Name]`,
  };
}

function getTemplateDefinition(
  selectedTemplate: string | null,
  customTemplates: CustomTemplate[],
): TemplateDefinition | null {
  if (!selectedTemplate) {
    return null;
  }

  if (selectedTemplate.startsWith("built-in:")) {
    const builtInKey = selectedTemplate.replace(
      "built-in:",
      "",
    ) as BuiltInTemplateKey;

    return BUILT_IN_TEMPLATES[builtInKey] ?? null;
  }

  if (selectedTemplate.startsWith("custom:")) {
    const customTemplateId = selectedTemplate.replace("custom:", "");
    const customTemplate = customTemplates.find(
      (template) => template.id === customTemplateId,
    );

    return customTemplate ? buildCustomTemplateDefinition(customTemplate) : null;
  }

  return null;
}

export default function ComposeDock() {
  const [composeState, setComposeState] = useState<ComposeState>("closed");
  const [composeSize, setComposeSize] = useState({ width: 480, height: 620 });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isCustomTagEditorOpen, setIsCustomTagEditorOpen] = useState(false);
  const [isCcVisible, setIsCcVisible] = useState(false);
  const [isBccVisible, setIsBccVisible] = useState(false);
  const [customTemplateForm, setCustomTemplateForm] = useState(
    INITIAL_CUSTOM_TEMPLATE_FORM,
  );
  const [customTemplateError, setCustomTemplateError] = useState("");
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const toInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedCustomTemplatesRef = useRef(false);
  const resizeStateRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const clampComposeSize = (width: number, height: number) => {
    if (typeof window === "undefined") {
      return { width, height };
    }

    return {
      width: Math.min(Math.max(width, 360), window.innerWidth - 40),
      height: Math.min(Math.max(height, 420), window.innerHeight - 40),
    };
  };

  const openCompose = () => {
    setComposeState("open");
  };

  const closeCompose = () => {
    setComposeState("closed");
    setIsCustomTagEditorOpen(false);
    setIsCcVisible(false);
    setIsBccVisible(false);
    setCustomTemplateError("");
  };

  const minimizeCompose = () => {
    setComposeState((currentState) =>
      currentState === "minimized" ? "open" : "minimized",
    );
  };

  const applyTemplate = (templateKey: string) => {
    const template = getTemplateDefinition(templateKey, customTemplates);

    if (!template) {
      return;
    }

    setSelectedTemplate(templateKey);
    setDraft((currentDraft) => ({
      ...currentDraft,
      subject: template.subject,
      body: template.body,
    }));
  };

  const updateDraftField = (
    field: keyof typeof INITIAL_DRAFT,
    value: string,
  ) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const updateCustomTemplateField = (
    field: keyof typeof INITIAL_CUSTOM_TEMPLATE_FORM,
    value: string,
  ) => {
    setCustomTemplateForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetDraft = () => {
    const selectedTemplateDefinition = getTemplateDefinition(
      selectedTemplate,
      customTemplates,
    );

    setDraft({
      to: "",
      cc: "",
      bcc: "",
      subject: selectedTemplateDefinition?.subject ?? "",
      body: selectedTemplateDefinition?.body ?? "",
    });
  };

  const openCustomTagEditor = () => {
    setIsCustomTagEditorOpen(true);
    setCustomTemplateError("");
  };

  const cancelCustomTagEditor = () => {
    setIsCustomTagEditorOpen(false);
    setCustomTemplateForm(INITIAL_CUSTOM_TEMPLATE_FORM);
    setCustomTemplateError("");
  };

  const saveCustomTemplate = () => {
    const trimmedLabel = customTemplateForm.label.trim();
    const trimmedPrompt = customTemplateForm.prompt.trim();

    if (!trimmedLabel || !trimmedPrompt) {
      setCustomTemplateError("Add both a tag name and a prompt.");
      return;
    }

    const duplicateTemplate = customTemplates.find(
      (template) => template.label.toLowerCase() === trimmedLabel.toLowerCase(),
    );

    if (duplicateTemplate) {
      setCustomTemplateError("That tag name already exists.");
      return;
    }

    const newCustomTemplate: CustomTemplate = {
      id: `${Date.now()}`,
      label: trimmedLabel,
      prompt: trimmedPrompt,
    };

    const nextCustomTemplates = [...customTemplates, newCustomTemplate];

    setCustomTemplates(nextCustomTemplates);
    setCustomTemplateForm(INITIAL_CUSTOM_TEMPLATE_FORM);
    setCustomTemplateError("");
    setIsCustomTagEditorOpen(false);
    setSelectedTemplate(`custom:${newCustomTemplate.id}`);
    setDraft((currentDraft) => ({
      ...currentDraft,
      subject: newCustomTemplate.label,
      body: buildCustomTemplateDefinition(newCustomTemplate).body,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetDraft();
    closeCompose();
  };

  useEffect(() => {
    const storedCustomTemplates = window.localStorage.getItem(
      CUSTOM_TEMPLATE_STORAGE_KEY,
    );

    if (!storedCustomTemplates) {
      hasLoadedCustomTemplatesRef.current = true;
      return;
    }

    try {
      const parsedTemplates = JSON.parse(storedCustomTemplates);

      if (Array.isArray(parsedTemplates)) {
        const validTemplates = parsedTemplates.filter((template) => {
          return (
            typeof template?.id === "string" &&
            typeof template?.label === "string" &&
            typeof template?.prompt === "string"
          );
        }) as CustomTemplate[];

        startTransition(() => {
          setCustomTemplates(validTemplates);
        });
      }
    } catch {
      window.localStorage.removeItem(CUSTOM_TEMPLATE_STORAGE_KEY);
    }

    hasLoadedCustomTemplatesRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedCustomTemplatesRef.current) {
      return;
    }

    window.localStorage.setItem(
      CUSTOM_TEMPLATE_STORAGE_KEY,
      JSON.stringify(customTemplates),
    );
  }, [customTemplates]);

  useEffect(() => {
    if (composeState !== "open") {
      return;
    }

    toInputRef.current?.focus();
  }, [composeState]);

  useEffect(() => {
    if (composeState === "closed") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCompose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [composeState]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!resizeStateRef.current) {
        return;
      }

      const nextWidth =
        resizeStateRef.current.startWidth -
        (event.clientX - resizeStateRef.current.startX);
      const nextHeight =
        resizeStateRef.current.startHeight -
        (event.clientY - resizeStateRef.current.startY);

      setComposeSize(clampComposeSize(nextWidth, nextHeight));
    };

    const stopResizing = () => {
      resizeStateRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
    };
  }, []);

  useEffect(() => {
    const syncComposeSize = () => {
      setComposeSize((currentSize) =>
        clampComposeSize(currentSize.width, currentSize.height),
      );
    };

    syncComposeSize();
    window.addEventListener("resize", syncComposeSize);

    return () => {
      window.removeEventListener("resize", syncComposeSize);
    };
  }, []);

  const startResizing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (composeState !== "open") {
      return;
    }

    resizeStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: composeSize.width,
      startHeight: composeSize.height,
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "nwse-resize";
  };

  const templateButtons = [
    ...Object.entries(BUILT_IN_TEMPLATES).map(([key, template]) => ({
      key: `built-in:${key}`,
      label: template.label,
    })),
    ...customTemplates.map((template) => ({
      key: `custom:${template.id}`,
      label: template.label,
    })),
  ];

  const selectedTemplateLabel = getTemplateDefinition(
    selectedTemplate,
    customTemplates,
  )?.label;

  return (
    <>
      <button
        type="button"
        onClick={openCompose}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        <svg
          className="size-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 8h10M8 3v10" />
        </svg>
        Compose
      </button>

      <section
        className="gmail-compose-shell"
        data-state={composeState}
        aria-hidden={composeState === "closed"}
        style={
          composeState === "open"
            ? { width: composeSize.width }
            : undefined
        }
      >
        <div
          className="gmail-compose-window"
          role="dialog"
          aria-modal="false"
          aria-labelledby="compose-title"
          style={
            composeState === "open"
              ? { height: composeSize.height, maxHeight: composeSize.height }
              : undefined
          }
        >
          <header className="gmail-compose-header">
            <div className="gmail-compose-heading">
              <p id="compose-title" className="gmail-compose-title">
                New Message
              </p>
              <p className="gmail-compose-subtitle">
                {selectedTemplateLabel ?? "No template selected"}
              </p>
            </div>

            <div className="gmail-compose-controls">
              <button
                type="button"
                onClick={minimizeCompose}
                className="gmail-compose-icon-button"
                aria-label={
                  composeState === "minimized"
                    ? "Expand compose window"
                    : "Minimize compose window"
                }
              >
                {composeState === "minimized" ? (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 10l4-4 4 4" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 8h8" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={closeCompose}
                className="gmail-compose-icon-button"
                aria-label="Close compose window"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          </header>

          <button
            type="button"
            className="gmail-compose-resize-handle"
            onPointerDown={startResizing}
            aria-label="Resize compose window"
            title="Drag to resize"
          />

          <div
            className="gmail-compose-content"
            hidden={composeState === "minimized"}
          >
            <div className="gmail-template-bar">
              <div className="gmail-template-toolbar">
                <div
                  className="gmail-template-track"
                  role="tablist"
                  aria-label="Email templates"
                >
                  {templateButtons.map((template) => {
                    const isActive = selectedTemplate === template.key;

                    return (
                      <button
                        key={template.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => applyTemplate(template.key)}
                        className={`gmail-template-pill ${isActive ? "gmail-template-pill-active" : ""}`}
                      >
                        {template.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={openCustomTagEditor}
                  className="gmail-template-add-button"
                >
                  + Custom Tag
                </button>
              </div>

              {isCustomTagEditorOpen ? (
                <div className="gmail-custom-tag-panel">
                  <div className="gmail-custom-tag-grid">
                    <label className="gmail-custom-tag-field">
                      <span className="gmail-compose-field-label">Tag Name</span>
                      <input
                        type="text"
                        value={customTemplateForm.label}
                        onChange={(event) =>
                          updateCustomTemplateField("label", event.target.value)
                        }
                        placeholder="Tag Name"
                        className="gmail-custom-tag-input"
                      />
                    </label>

                    <label className="gmail-custom-tag-field gmail-custom-tag-field-wide">
                      <span className="gmail-compose-field-label">Prompt</span>
                      <textarea
                        value={customTemplateForm.prompt}
                        onChange={(event) =>
                          updateCustomTemplateField("prompt", event.target.value)
                        }
                        placeholder="Example: I am writing to share the latest progress on [project] and highlight the next steps."
                        className="gmail-custom-tag-textarea"
                      />
                    </label>
                  </div>

                  <div className="gmail-custom-tag-footer">
                    <p className="gmail-custom-tag-help">
                      Your prompt becomes a reusable email draft starter and is
                      saved locally in this browser.
                    </p>

                    <div className="gmail-custom-tag-actions">
                      <button
                        type="button"
                        onClick={cancelCustomTagEditor}
                        className="gmail-custom-tag-secondary-button"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveCustomTemplate}
                        className="gmail-custom-tag-primary-button"
                      >
                        Save Tag
                      </button>
                    </div>
                  </div>

                  {customTemplateError ? (
                    <p className="gmail-custom-tag-error">
                      {customTemplateError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="gmail-compose-form">
              <div className="gmail-compose-fields">
                <label className="gmail-compose-field">
                  <div className="gmail-compose-inline-field">
                    <span className="gmail-compose-inline-label">To</span>
                    <input
                      ref={toInputRef}
                      type="email"
                      value={draft.to}
                      onChange={(event) =>
                        updateDraftField("to", event.target.value)
                      }
                      className="gmail-compose-inline-input"
                    />
                    <div className="gmail-compose-inline-actions">
                      <button
                        type="button"
                        className={`gmail-compose-inline-toggle ${isCcVisible || draft.cc ? "gmail-compose-inline-toggle-active" : ""}`}
                        onClick={() => setIsCcVisible((currentState) => !currentState)}
                      >
                        Cc
                      </button>
                      <button
                        type="button"
                        className={`gmail-compose-inline-toggle ${isBccVisible || draft.bcc ? "gmail-compose-inline-toggle-active" : ""}`}
                        onClick={() => setIsBccVisible((currentState) => !currentState)}
                      >
                        Bcc
                      </button>
                    </div>
                  </div>
                </label>

                {isCcVisible ? (
                  <label className="gmail-compose-field">
                    <div className="gmail-compose-inline-field">
                      <span className="gmail-compose-inline-label">Cc</span>
                      <input
                        type="email"
                        value={draft.cc}
                        onChange={(event) =>
                          updateDraftField("cc", event.target.value)
                        }
                        className="gmail-compose-inline-input"
                      />
                    </div>
                  </label>
                ) : null}

                {isBccVisible ? (
                  <label className="gmail-compose-field">
                    <div className="gmail-compose-inline-field">
                      <span className="gmail-compose-inline-label">Bcc</span>
                      <input
                        type="email"
                        value={draft.bcc}
                        onChange={(event) =>
                          updateDraftField("bcc", event.target.value)
                        }
                        className="gmail-compose-inline-input"
                      />
                    </div>
                  </label>
                ) : null}

                <label className="gmail-compose-field">
                  <div className="gmail-compose-inline-field">
                    <span className="gmail-compose-inline-label">Subject</span>
                    <input
                      type="text"
                      value={draft.subject}
                      onChange={(event) =>
                        updateDraftField("subject", event.target.value)
                      }
                      className="gmail-compose-inline-input"
                    />
                  </div>
                </label>

                <label className="gmail-compose-editor">
                  <span className="gmail-compose-field-label">Message</span>
                  <textarea
                    value={draft.body}
                    onChange={(event) =>
                      updateDraftField("body", event.target.value)
                    }
                    placeholder="Write your message here, or pick a template above."
                    className="gmail-compose-textarea"
                  />
                </label>
              </div>

              <footer className="gmail-compose-footer">
                <div className="gmail-compose-footer-left">
                  <button type="submit" className="gmail-send-button">
                    Send
                  </button>

                  <div
                    className="gmail-compose-tools"
                    aria-label="Compose actions"
                  >
                    {FOOTER_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        className="gmail-compose-tool-button"
                        aria-label={action.label}
                        title={action.label}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={action.path} />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="gmail-compose-note">
                  {selectedTemplateLabel
                    ? `${selectedTemplateLabel} template applied`
                    : "Choose a template or start from scratch"}
                </p>
              </footer>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

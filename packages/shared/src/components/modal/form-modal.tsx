"use client";

import type { FormRendererProps, FormValues } from "../forms";
import { FormRenderer } from "../forms";
import { Modal, type ModalProps } from "./modal";

export interface FormModalProps
  extends Pick<ModalProps, "open" | "onClose" | "title" | "description" | "width">,
    Omit<FormRendererProps, "onCancel"> {
  /** Translation key for the cancel button (default "cancel"). */
  cancelLabel?: string;
  /** Close the modal automatically after a successful submit (default true). */
  closeOnSubmit?: boolean;
}

export function FormModal({
  open,
  onClose,
  title,
  description,
  width,
  closeOnSubmit = true,
  onSubmit,
  ...formProps
}: FormModalProps) {
  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
    if (closeOnSubmit) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} width={width}>
      <FormRenderer {...formProps} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}

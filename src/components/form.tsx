import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const labelClasses = "block text-sm font-medium text-ink";

export const inputClasses =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-muted/70 transition-colors duration-150 hover:border-muted/50 read-only:bg-bg read-only:text-muted";

type FieldShellProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
};

function FieldShell({ id, label, helper, error, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : helper ? (
        <p className="mt-1 text-sm text-muted">{helper}</p>
      ) : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  helper?: string;
  error?: string;
};

export function TextField({ id, label, helper, error, ...inputProps }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} helper={helper} error={error}>
      <input id={id} className={inputClasses} {...inputProps} />
    </FieldShell>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  helper?: string;
  error?: string;
};

export function TextareaField({
  id,
  label,
  helper,
  error,
  rows = 4,
  ...textareaProps
}: TextareaFieldProps) {
  return (
    <FieldShell id={id} label={label} helper={helper} error={error}>
      <textarea
        id={id}
        rows={rows}
        className={`${inputClasses} resize-y`}
        {...textareaProps}
      />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  options: string[];
  /** Disabled empty option shown first, e.g. "Select a role". */
  placeholder?: string;
};

export function SelectField({
  id,
  label,
  helper,
  error,
  options,
  placeholder,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} helper={helper} error={error}>
      <select id={id} className={inputClasses} {...selectProps}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

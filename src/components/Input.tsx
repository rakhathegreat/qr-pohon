import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const inputVariants = cva(
  'w-full rounded-md border font-normal transition hover:cursor-input focus-visible:outline-none focus-visible:ring-3 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400',
  {
    variants: {
      variant: {
        default:
          'bg-white border-gray-300 text-gray-900 focus-visible:border-brand-500 focus-visible:ring-brand-200',
        subtle:
          'bg-brand-50 border-transparent text-brand-900 focus-visible:border-brand-400 focus-visible:ring-brand-100',
      },
      size: {
        sm: 'px-3 py-2.5 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-5 py-3.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  VariantProps<typeof inputVariants> & {
    label?: string;
    helperText?: string;
    error?: string;
    onValueChange?: (value: string) => void;
    clearOnEscape?: boolean;
    showEscapeHint?: boolean;
  };

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      className,
      variant,
      size,
      type = 'text',
      value,
      defaultValue,
      onValueChange,
      clearOnEscape = true,
      showEscapeHint = true,
      onKeyDown,
      onChange,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (defaultValue === undefined) return '';
      if (typeof defaultValue === 'string') return defaultValue;
      if (Array.isArray(defaultValue)) return defaultValue.join(', ');
      return String(defaultValue);
    });

    useEffect(() => {
      if (isControlled) {
        if (Array.isArray(value)) setInternalValue(value.join(', '));
        else setInternalValue(value ? String(value) : '');
      }
    }, [isControlled, value]);

    const currentValue = isControlled ? (value ?? '') : internalValue;
    const hasValue = `${currentValue ?? ''}`.length > 0;

    const applyValue = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(event.target.value);
      onValueChange?.(event.target.value);
      onChange?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape' && clearOnEscape && hasValue) {
        event.preventDefault();
        event.stopPropagation();
        applyValue('');
        return;
      }

      onKeyDown?.(event);
    };

    const messageId = error || helperText ? `${id ?? props.name ?? 'input'}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="font-sans mb-2 block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}

        <div className='relative'>
          <input
            id={id}
            ref={(node) => {
              innerRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            type={type}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-invalid={Boolean(error)}
            aria-describedby={messageId}
            className={cn(
              inputVariants({ variant, size }),
              showEscapeHint && hasValue && 'pr-16',
              error && 'border-red-400 focus-visible:ring-red-200',
              className
            )}
            {...props}
          />

          {showEscapeHint && hasValue &&  (
            <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase text-gray-500 sm:inline-flex">
              esc
            </span>
          )}
        </div>

        {error ? (
          <p id={messageId} className="mt-2 text-sm text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={messageId} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
export default Input;

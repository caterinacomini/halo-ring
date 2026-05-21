import classnames from "classnames";
import styles from "./Button.module.scss";
import type { ButtonData } from "./dto";

interface ButtonProps {
  componentData: ButtonData;
}

export default function Button({ componentData }: ButtonProps) {
  const { label, href, variant = "primary", disabled = false } = componentData;

  const className = classnames(styles.button, styles[`button--${variant}`], {
    [styles["button--disabled"]]: disabled,
  });

  if (href) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button className={className} disabled={disabled}>
      {label}
    </button>
  );
}

import type { ButtonHTMLAttributes } from "react";
import "./botao.css";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    texto?: string;
    className?: string;
}

export default function Botao({
    texto,
    onClick,
    type = "button",
    className = "",
    ...props
}: BotaoProps) {
    const classes = ["botao", className].filter(Boolean).join(" ");

    return (
        <button className={classes} onClick={onClick} type={type} {...props}>
            {texto || "Clique aqui"}
        </button>
    );
}
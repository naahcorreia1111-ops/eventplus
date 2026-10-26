import type  { ButtonHTMLAttributes } from "react";


    interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement>{
        texto?: string;
        className?: string;
    }


    import "./Botao.css"


    function Botao({
        texto,
        onClick,
        type = "button",
        className = "",
        ...props
    }: BotaoProps) {


        const classes = ["botao", className].filter(Boolean).join(" ");


        return (
            <button className={classes} onClick={onClick} type={type} {...props}>{texto || "Clique aqui"}</button>
        )
    
}
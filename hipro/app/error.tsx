"use client";
export default function ErrorPage({reset}:{reset:()=>void}) {return <main className="legal"><a href="/">Duna Equipamentos</a><h1>Não foi possível carregar agora.</h1><p>Tente novamente em instantes.</p><button className="button" onClick={reset}>Tentar novamente</button></main>;}


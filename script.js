
/* ==========================================
   CONFIGURAÇÕES DO WEB3FORMS
========================================== */

const WEB3FORMS_ACCESS_KEY = "d2a11cf3-8786-4b8c-a244-0a3fdc4f6753";


/* ==========================================
   ANIMAÇÃO DE ENTRADA DAS SEÇÕES
========================================== */

const secoes = document.querySelectorAll(
    "section:not(#painel-admin)"
);

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("mostrar");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    secoes.forEach((secao) => {
        secao.classList.add("esconder");
        observer.observe(secao);
    });

} else {
    secoes.forEach((secao) => {
        secao.classList.add("mostrar");
    });
}


/* ==========================================
   ARMAZENAMENTO DAS MENSAGENS
========================================== */

const CHAVE_MENSAGENS = "portfolio_mensagens";

function gerarId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return Date.now().toString() +
        Math.random().toString(16).slice(2);
}

function obterMensagens() {
    try {
        const dados = localStorage.getItem(CHAVE_MENSAGENS);

        if (!dados) {
            return [];
        }

        const mensagens = JSON.parse(dados);

        return Array.isArray(mensagens) ? mensagens : [];

    } catch (erro) {
        console.error("Erro ao carregar mensagens:", erro);
        return [];
    }
}

function salvarMensagens(mensagens) {
    try {
        localStorage.setItem(
            CHAVE_MENSAGENS,
            JSON.stringify(mensagens)
        );

        return true;

    } catch (erro) {
        console.error("Erro ao salvar mensagens:", erro);
        return false;
    }
}


/* ==========================================
   MENSAGENS DE TESTE
   Criadas quando o armazenamento está vazio.
========================================== */

function criarMensagensDeTeste() {
    const mensagens = [];

    const nomes = [
        "Ana Silva",
        "Pedro Santos",
        "Mariana Costa",
        "Lucas Oliveira",
        "Beatriz Souza",
        "Rafael Lima",
        "Camila Ferreira",
        "João Almeida",
        "Isabela Rocha",
        "Gabriel Martins",
        "Laura Ribeiro",
        "Matheus Carvalho",
        "Julia Gomes",
        "Felipe Mendes",
        "Sofia Barbosa",
        "Bruno Cardoso",
        "Amanda Nunes",
        "Leonardo Dias",
        "Letícia Moreira",
        "Vinícius Araújo"
    ];

    for (let i = 0; i < 20; i++) {
        mensagens.push({
            id: gerarId(),
            nome: nomes[i],
            email: `contato${i + 1}@exemplo.com`,
            assunto: "Mensagem de demonstração",
            mensagem:
                "Esta é uma mensagem de teste para demonstrar " +
                "o funcionamento do painel administrativo.",
            data: new Date(
                Date.now() - i * 86400000
            ).toISOString(),
            lida: false
        });
    }

    salvarMensagens(mensagens);
}

function inicializarMensagens() {
    try {
        const mensagensSalvas = localStorage.getItem(
            CHAVE_MENSAGENS
        );

        if (
            mensagensSalvas === null ||
            obterMensagens().length === 0
        ) {
            criarMensagensDeTeste();
        }

    } catch (erro) {
        console.error(
            "Não foi possível inicializar as mensagens:",
            erro
        );
    }
}

inicializarMensagens();


/* ==========================================
   FORMULÁRIO DE CONTATO - WEB3FORMS
========================================== */

const formulario = document.querySelector("#form-contato");

const statusFormulario = document.querySelector(
    "#status-formulario"
);

const botaoEnviar = document.querySelector("#btn-enviar");

if (formulario) {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nome = document.querySelector("#nome").value.trim();
        const email = document.querySelector("#email").value.trim();
        const assunto = document.querySelector("#assunto").value.trim();
        const mensagem = document.querySelector("#mensagem").value.trim();

        if (!nome || !email || !assunto || !mensagem) {
            statusFormulario.textContent =
                "Preencha todos os campos.";

            return;
        }

        botaoEnviar.disabled = true;
        botaoEnviar.textContent = "Enviando...";

        statusFormulario.textContent =
            "Enviando sua mensagem...";

        try {
            const resposta = await fetch(
                "https://api.web3forms.com/submit",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        name: nome,
                        email: email,
                        subject: assunto,
                        message: mensagem
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.success) {
                throw new Error(
                    resultado.message || "Não foi possível enviar."
                );
            }

            const novaMensagem = {
                id: gerarId(),
                nome: nome,
                email: email,
                assunto: assunto,
                mensagem: mensagem,
                data: new Date().toISOString(),
                lida: false
            };

            const mensagens = obterMensagens();

            mensagens.unshift(novaMensagem);

            const salvou = salvarMensagens(mensagens);

            if (!salvou) {
                console.error(
                    "O e-mail foi enviado, mas não foi possível salvar a mensagem no navegador."
                );
            }

            statusFormulario.textContent =
                "Mensagem enviada com sucesso! Obrigado pelo contato.";

            formulario.reset();

            atualizarPainel();

        } catch (erro) {
            console.error("Erro no envio do formulário:", erro);

            statusFormulario.textContent =
                "Não foi possível enviar sua mensagem. Tente novamente.";

        } finally {
            botaoEnviar.disabled = false;
            botaoEnviar.textContent = "Enviar mensagem";
        }
    });
}


/* ==========================================
   PAINEL ADMINISTRATIVO
========================================== */

const painelAdmin = document.querySelector("#painel-admin");

const botaoAbrirAdmin = document.querySelector("#abrir-admin");

const botaoFecharAdmin = document.querySelector("#fechar-admin");

const listaMensagens = document.querySelector("#lista-mensagens");

const totalMensagens = document.querySelector("#total-mensagens");


function abrirPainel() {
    if (!painelAdmin) return;

    painelAdmin.hidden = false;

    atualizarPainel();

    painelAdmin.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function fecharPainel() {
    if (!painelAdmin) return;

    painelAdmin.hidden = true;
}

if (botaoAbrirAdmin) {
    botaoAbrirAdmin.addEventListener("click", abrirPainel);
}

if (botaoFecharAdmin) {
    botaoFecharAdmin.addEventListener("click", fecharPainel);
}


/* ATALHO CTRL + SHIFT + A */

document.addEventListener("keydown", (evento) => {
    if (
        evento.ctrlKey &&
        evento.shiftKey &&
        evento.key.toLowerCase() === "a"
    ) {
        evento.preventDefault();

        if (!painelAdmin) return;

        if (painelAdmin.hidden) {
            abrirPainel();
        } else {
            fecharPainel();
        }
    }
});


/* ==========================================
   EXIBIR MENSAGENS NO PAINEL
========================================== */

function atualizarPainel() {
    if (!listaMensagens || !totalMensagens) {
        return;
    }

    const mensagens = obterMensagens();

    totalMensagens.textContent =
        `${mensagens.length} mensagem(ns)`;

    listaMensagens.replaceChildren();

    if (mensagens.length === 0) {
        const aviso = document.createElement("p");

        aviso.textContent = "Nenhuma mensagem recebida.";

        listaMensagens.appendChild(aviso);

        return;
    }

    mensagens.forEach((mensagem) => {
        const card = document.createElement("article");

        card.classList.add("mensagem-admin");

        const titulo = document.createElement("h4");

        titulo.textContent = mensagem.nome;

        const email = document.createElement("p");

        email.textContent = `E-mail: ${mensagem.email}`;

        const assunto = document.createElement("p");

        assunto.textContent = `Assunto: ${mensagem.assunto}`;

        const texto = document.createElement("p");

        texto.textContent = mensagem.mensagem;

        const data = document.createElement("small");

        data.textContent = mensagem.data
            ? new Date(mensagem.data).toLocaleString("pt-BR")
            : "Data não informada";

        const estado = document.createElement("p");

        estado.textContent = mensagem.lida
            ? "Status: Lida"
            : "Status: Não lida";

        const botoes = document.createElement("div");

        botoes.classList.add("acoes-admin");


        /* BOTÃO EDITAR */

        const botaoEditar = document.createElement("button");

        botaoEditar.type = "button";

        botaoEditar.textContent = "Editar";

        botaoEditar.classList.add("btn-admin");

        botaoEditar.addEventListener("click", () => {
            editarMensagem(mensagem.id);
        });


        /* BOTÃO ALTERAR STATUS */

        const botaoStatus = document.createElement("button");

        botaoStatus.type = "button";

        botaoStatus.textContent = mensagem.lida
            ? "Marcar como não lida"
            : "Marcar como lida";

        botaoStatus.classList.add("btn-admin");

        botaoStatus.addEventListener("click", () => {
            alterarStatusMensagem(mensagem.id);
        });


        /* BOTÃO EXCLUIR */

        const botaoExcluir = document.createElement("button");

        botaoExcluir.type = "button";

        botaoExcluir.textContent = "Excluir";

        botaoExcluir.classList.add("btn-admin", "excluir");

        botaoExcluir.addEventListener("click", () => {
            excluirMensagem(mensagem.id);
        });


        botoes.append(
            botaoEditar,
            botaoStatus,
            botaoExcluir
        );

        card.append(
            titulo,
            email,
            assunto,
            texto,
            data,
            estado,
            botoes
        );

        listaMensagens.appendChild(card);
    });
}


/* ==========================================
   EDITAR MENSAGEM
========================================== */

function editarMensagem(id) {
    const mensagens = obterMensagens();

    const mensagem = mensagens.find(
        (item) => item.id === id
    );

    if (!mensagem) return;

    const novoAssunto = prompt(
        "Edite o assunto:",
        mensagem.assunto
    );

    if (novoAssunto === null) return;

    const novoTexto = prompt(
        "Edite a mensagem:",
        mensagem.mensagem
    );

    if (novoTexto === null) return;

    mensagem.assunto = novoAssunto.trim();

    mensagem.mensagem = novoTexto.trim();

    if (salvarMensagens(mensagens)) {
        atualizarPainel();
    }
}


/* ==========================================
   ALTERAR STATUS DA MENSAGEM
========================================== */

function alterarStatusMensagem(id) {
    const mensagens = obterMensagens();

    const mensagem = mensagens.find(
        (item) => item.id === id
    );

    if (!mensagem) return;

    mensagem.lida = !mensagem.lida;

    if (salvarMensagens(mensagens)) {
        atualizarPainel();
    }
}


/* ==========================================
   EXCLUIR MENSAGEM
========================================== */

function excluirMensagem(id) {
    const confirmar = window.confirm(
        "Tem certeza de que deseja excluir esta mensagem?"
    );

    if (!confirmar) return;

    const mensagens = obterMensagens().filter(
        (item) => item.id !== id
    );

    if (salvarMensagens(mensagens)) {
        atualizarPainel();
    }
}


/* ==========================================
   INICIALIZAÇÃO
========================================== */

atualizarPainel();

console.log("Portfólio carregado com sucesso!");

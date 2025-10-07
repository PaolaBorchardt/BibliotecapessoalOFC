const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require('fs').promises;
//const dayjs = require("day.js")
//const path = require('path');
const { randomUUID } = require('crypto'); //módulo nativo q gera id


// tem q ver pra qq serveconst DATA_FILE = path.resolve(__dirname, 'biblioteca.json'); // arquivo onde persistimos
let livros = []

const carregarLivros = async () => {
    try {
        const dados = await fs.readFile("livros.json", "utf-8");
        livros = JSON.parse(dados);
    } catch (erro) {
        livros = [];
    }
}

const salvarLivros = async () => {
    await fs.writeFile("livros.json", JSON.stringify(livros, null, 2));
}

const cadastrarLivro = async () => {
    const titulo = await input({ message: "Digite o título:" });
    const autor = await input({ message: "Digite o autor:" });
    const paginas = await input({ message: "Digite a quantidade de páginas:" });
    const genero = await input({ message: "Digite o gênero:" });

    //verifica se o valor existe. every = verifica se todos os itens do array atendem as condições 
    if (![titulo, autor, paginas, genero].every(campo => campo && campo.trim())) {
        console.log('Todos os campos devem ser preenchdos.');
        return;
    }

    //Coverte o valor de páginas que tava em string pra Inteiro
    const pagge = parseInt(paginas);

    //se pagge n for válida ou <0643

    if (!pagge || pagge <= 0) {
        console.log("Número de páginas inválido. Insira um número (maior que 0).");
        return;
    }
    console.log(`Livro cadastrado com sucesso! ${titulo}`);

    livros.push({
        id: randomUUID(),
        titulo: titulo,
        autor: autor,
        paginas: paginas,
        genero: genero,
        status: `quero_ler`,  // status inicial
        paginaAtual: 0,
        avaliacao: null,
        dataInicio: new Date().toLocaleString(),
        dataFim: new Date().toLocaleString()
    });
}

const listaDesejos = async () => { //Validações = 2. 1.Possui livros? 2.Algum é querendo_ler?
    if (livros.length === 0) {
        console.log("\nNenhum livro cadastrado.\n");
        return;
    }

    // Filtra apenas os livros com status 'quero_ler'
    const desejos = livros.filter(livro => livro.status === "quero_ler");

    if (desejos.length === 0) {
        console.log("✨ Nenhum livro na sua lista de desejos!");
        return;
    }

    console.log('\n --Lista de Desejos--\n')

    desejos.forEach((l, index) => {
        console.log(`${index + 1}. ${l.titulo} — ${l.autor} — ${l.paginas} — (${l.genero})`);
    });

    console.log("\nTotal de livros na lista de desejos:", desejos.length);
};

const atualizarStatus = async () => {
    //async function atualizarStatus() {
    if (livros.length === 0) {
        console.log("\nNenhum livro cadastrado.\n");
        return;
    }

    const livroSelecionado = await select({
        message: "Selecione o livro para atualizar:",
        choices: livros.map(l => ({            //l = nome da variavel dentro de map
            name: `${l.titulo} (${l.status})`,
            value: l.id
        }))
    });

    const novoStatus = await select({
        message: "Qual o novo status?",
        choices: [
            { name: " Quero ler", value: "quero_ler" },
            { name: " Lendo", value: "lendo" },
        ]
    });

    //Ptocura no array de livros - seleciona - novo status
    const livro = livros.find(l => l.id === livroSelecionado);
    livro.status = novoStatus;

    // Se marcar como lido, pode pedir avaliação


    console.log("✅ Status atualizado com sucesso!");
    await salvarLivros(); // salva no JSON
}

const atualizarProgresso = async () => {
    if (livros.length === 0) {
        console.log("❌ Nenhum livro cadastrado!");
        return;
    }

    // Filtra apenas livros que estão sendo lidos
    const lendo = livros.filter(l => l.status === "lendo");

    if (lendo.length === 0) {
        console.log("📖 Nenhum livro em leitura no momento.");
        return;
    }

    // Escolhe o livro em leitura
    const livroSelecionado = await select({
        message: "Escolha o livro que você está lendo:",
        choices: lendo.map(l => ({
            name: `${l.titulo} (páginas: ${l.paginaAtual}/${l.paginas})`,
            value: l.id
        }))
    });

    //n sei pra qq serve
    const livro = livros.find(l => l.id === livroSelecionado);
    if (!livro) {
        console.log("❌ Livro não encontrado.");
        return;
    }

    const totalPaginas = Number(livro.paginas);
    if (Number.isNaN(totalPaginas) || totalPaginas <= 0) {
        console.log("⚠️ Total de páginas inválido no cadastro.");
        return;
    }

    const novaPaginaInput = await input({
        message: "📄 Em qual página você parou?"
    });

    let novaPagina = Number(novaPaginaInput);
    //.isNaN verifica: “essa conversão falhou e o resultado não é um número válido?”.
    // Verifica se não ultrapassa o total de páginas
    if (novaPagina > totalPaginas) {
        console.log(`⚠️ Número de páginas lidas não pode ser maior que o total do livro (${totalPaginas}).`);
        return;
    }


    // Se o livro está sendo lido, mas ainda não tem dataInicio, registra agora
    if (livro.status === "lendo" && !livro.dataInicio) {
        livro.dataInicio = new Date().toLocaleString();
        console.log(`📅 Leitura iniciada em ${livro.dataInicio}.`);
    }

    // Atualiza progresso
    if (novaPagina >= totalPaginas) {
        livro.paginaAtual = totalPaginas;
        livro.status = "lido";
        livro.dataFim = new Date().toLocaleString();
        console.log(`🎉 Parabéns! Você concluiu "${livro.titulo}" em ${livro.dataFim}.`);
    } else {
        livro.paginaAtual = novaPagina;
        console.log(`📖 Progresso atualizado: página ${livro.paginaAtual} de ${totalPaginas}`);
    }
    if (livro.status === "lido") {
        const avaliacaoEstrelas = await input({
            message: "De 1 a 5 estrelas, quanto você avalia esse livro?"
        });


        //const avaliacao = Number(avaliacaoEstrelas);
        const avaliacao = parseInt(avaliacaoEstrelas);
        if (avaliacao >= 1 && avaliacao <= 5) {
            livro.avaliacao = avaliacao;
            console.log(`⭐ Você avaliou "${livro.titulo}" com ${avaliacao} estrela(s)!`);
        } else {
            console.log("⚠️ Avaliação inválida. Deve ser entre 1 e 5.");
        }

        await salvarLivros(); // grava a atualização no arquivo JSON
    }
};
const estatisticas = async () => {
    // 1️⃣ Verifica se existem livros cadastrados
    if (!Array.isArray(livros) || livros.length === 0) {
        console.log("⚠️ Não existem livros cadastrados para gerar estatísticas!");
        return;
    }

    // 2️⃣ Filtra apenas livros concluídos
    const lidos = livros.filter(l => l.status === "lido" && l.dataFim);

    if (lidos.length === 0) {
        console.log("⚠️ Nenhum livro foi concluído ainda!");
        return;
    }

    // 3️⃣ Livros por mês
    const livrosPorMes = {};
    lidos.forEach(l => {
        const data = new Date(l.dataFim);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        livrosPorMes[mesAno] = (livrosPorMes[mesAno] || 0) + 1;
    });

    // 4️⃣ Gênero favorito (considerando avaliação)
    const generos = {};
    lidos.forEach(l => {
        if (!l.genero) return;
        if (!generos[l.genero]) generos[l.genero] = { count: 0, totalAvaliacao: 0 };
        generos[l.genero].count++;
        generos[l.genero].totalAvaliacao += l.avaliacao || 0;
    });

    const generoFavorito = Object.entries(generos)
        .map(([genero, data]) => ({
            genero,
            count: data.count,
            mediaAvaliacao: data.totalAvaliacao / data.count
        }))
        .sort((a, b) => b.mediaAvaliacao - a.mediaAvaliacao || b.count - a.count)[0] || null;

    // 5️⃣ Total de livros lidos
    const totalLidos = lidos.length;

    // 6️⃣ Média de páginas por livro
    const mediaPaginas = totalLidos
        ? lidos.reduce((acc, l) => acc + Number(l.paginas), 0) / totalLidos
        : 0;

    const mediaPaginasArredondada = Math.round(mediaPaginas * 10) / 10;

    // 7️⃣ Mostra as estatísticas no console
    console.log("\n📊 Estatísticas de leitura:");
    console.log("Total de livros lidos:", totalLidos);
    console.log("Média de páginas por livro:", mediaPaginasArredondada);
    console.log("Livros por mês:", livrosPorMes);
    console.log("Gênero favorito:", generoFavorito ? `${generoFavorito.genero} (média: ${generoFavorito.mediaAvaliacao.toFixed(1)}, count: ${generoFavorito.count})` : "Nenhum");

    return { livrosPorMes, generoFavorito, totalLidos, mediaPaginas: mediaPaginasArredondada };
};

const deletarLivros = async () => {

    if (livros.length == 0) {
        console.log("Não existem livros para deletar!");
        return;
    }

    // Prepara as opções para o checkbox
    const escolhas = livros.map(l => ({
        name: `${l.titulo} — ${l.autor}`, // o que aparece para o usuário
        value: l.id                        // valor usado para identificar o livro
    }));

    const itensADeletar = await checkbox({
        message: "Selecione um iivro para deletar",
        choices: escolhas,
        instructions: false,
    });

    if (itensADeletar.length == 0) {
        console.log = ("Nenhum livro para deletar!");
        return;
    }

    livros = livros.filter(l => !itensADeletar.includes(l.id));

    console.log("Livro(s) deletado(s) com sucesso!");

    /* Isso é necessário?
    
    // Função para carregar livros do JSON na inicialização
const carregarLivros = async () => {
  try {
    const data = await fs.readFile('livros.json', 'utf-8');
    livros = JSON.parse(data);
  } catch {
    livros = []; // Se não existir o arquivo ainda, inicia vazio
  }
};
*/


}
const start = async () => {
    await carregarLivros();

    while (true) {
        await salvarLivros()

        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar Livro",
                    value: "cadastrar"
                },
                {
                    name: "Atualizar STATUS do Livro",
                    value: "atualizarStatus"
                },
                {
                    name: "Lista de Desejos",
                    value: "desejos"
                },
                {
                    name: "Atualizar páginas",
                    value: "progresso"
                },
                {
                    name: "Análise de estátisticas",
                    value: "estatisticas"
                },
                {
                    name: "Deletar Itens",
                    value: "deletar"
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        });

        switch (opcao) {
            case "cadastrar":
                await cadastrarLivro();
                break;
            case "atualizarStatus":
                await atualizarStatus();
                break;
            case "desejos":
                await listaDesejos();
                break;
            case "progresso":
                await atualizarProgresso();
                break;
            case "estatisticas":
                await estatisticas();
                break;
            case "deletar":
                await deletarLivros();
                break;
            case "sair":
                console.log(`Até a próxima!`);
                return;
        }
    }
}

start();
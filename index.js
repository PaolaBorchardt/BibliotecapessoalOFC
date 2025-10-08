// 📚 BIBLIOTECA PESSOAL — Gerenciador de Leituras

const { select, input, checkbox } = require('@inquirer/prompts'); //Biblioteca externa de node.js
const fs = require('fs').promises; //módulo nativo de node.js - funções assincronas
const { randomUUID } = require('crypto'); //módulo nativo q gera id

let livros = [] // Array principal que armazena todos os livros


// 🔸 Funções de Persistência (Carregar e Salvar JSON)

// Função que BUSCA os livros salvos no arquivo JSON
// "async" significa que ela vai esperar a leitura do arquivo terminar antes de continuar
const carregarLivros = async () => {
    try {
        const dados = await fs.readFile("livros.json", "utf-8"); // Lê o arquivo e retorna o conteúdo em texto
        livros = JSON.parse(dados); // Converte o texto JSON em um array de objetos JavaScript
    } catch (erro) {
        livros = []; // Se o arquivo não existir ou der erro, cria um array vazio
    }
}

// Função que GRAVA os livros no arquivo JSON (salva as alterações)
const salvarLivros = async () => {
    // JSON.stringify transforma o array 'livros' em texto para salvar no arquivo
    // O "null, 2" serve para deixar o arquivo organizado e fácil de ler
    await fs.writeFile("livros.json", JSON.stringify(livros, null, 2));
} // Essa função garante que as mudanças não se percam quando fechar o programa


// 🔸 Cadastro de Livro

// Função que ADICIONA um novo livro ao sistema
const cadastrarLivro = async () => {
    const titulo = await input({ message: "Digite o título:" });
    const autor = await input({ message: "Digite o autor:" });
    const paginas = await input({ message: "Digite a quantidade de páginas:" });
    const genero = await input({ message: "Digite o gênero:" });

    // Verifica se TODOS os campos foram preenchidos (não podem estar vazios)
    // every = verifica se todos os itens do array atendem a condição
    // trim() = remove espaços em branco no início e fim do texto
    if (![titulo, autor, paginas, genero].every(campo => campo && campo.trim())) {
        console.log("Todos os campos devem ser preenchidos.");
        return; // Para a função aqui se algum campo estiver vazio
    }

    // Converte o valor de páginas de texto (string) para número inteiro
    const pagge = parseInt(paginas);

    // Verifica se o número de páginas é válido (tem que ser maior que 0)
    if (!pagge || pagge <= 0) {
        console.log("Número de páginas inválido. Insira um número (maior que 0).");
        return; // Para a função se o número for inválido
    }
    console.log(`O livro ${titulo} foi cadastrado com sucesso!`);

    // ✅ ADICIONA um novo livro ao final do array 'livros'
    // push() = adiciona um item no final da lista
    livros.push({
        id: randomUUID(),                           // Gera um código único para identificar este livro
        titulo: titulo,                             // Nome do livro
        autor: autor,                               // Nome de quem escreveu
        paginas: paginas,                           // Quantas páginas tem no total
        genero: genero,                             // Tipo de livro (romance, aventura, etc)
        status: `quero_ler`,                        // Começa como "quero ler" (não começou a ler ainda)
        paginaAtual: 0,                             // Está na página 0 (não começou)
        avaliacao: null,                            // null = vazio, ainda não tem nota
        dataInicio: new Date().toLocaleString(),    // Registra quando o livro foi cadastrado
        dataFim: null                               // Ainda não terminou de ler
    });
}

// Função que MOSTRA os livros que você ainda quer ler
const listaDesejos = async () => {
    // Primeiro verifica se existe pelo menos 1 livro cadastrado
    if (livros.length === 0) {
        console.log("\nNenhum livro cadastrado.\n");
        return; // Para aqui se não tiver nenhum livro
    }

    // filter() = cria uma nova lista só com os livros que têm status 'quero_ler'
    const desejos = livros.filter(livro => livro.status === "quero_ler");

    if (desejos.length === 0) {
        console.log(" Nenhum livro na sua lista de desejos!");
        return;
    }

    console.log(`\n✨ Lista de Desejos ✨\n`);

    // forEach = repete uma ação para cada livro da lista
    // index = posição do livro na lista (começa em 0, por isso somamos +1)
    desejos.forEach((l, index) => {
        console.log(`${index + 1}. ${l.titulo} — ${l.autor} — ${l.paginas} — (${l.genero})`);
    });

    console.log("\nTotal de livros na lista de desejos:", desejos.length);

};

// Função que MUDA o status do livro (quero ler → lendo, ou lido para lendo -> ler)
const atualizarStatus = async () => {
    if (livros.length === 0) {
        console.log("\nNenhum livro cadastrado.\n");
        return;
    }

    console.log(`\n✨Altere o status do seu Livro ✨\n`);

    // Mostra um menu com todos os livros para o usuário escolher
    const livroSelecionado = await select({
        message: "Selecione o livro para atualizar:",
        // map() = transforma cada livro em uma opção do menu
        choices: livros.map(l => ({            // 'l' representa cada livro da lista
            name: `${l.titulo} (${l.status})`, // O que aparece na tela
            value: l.id                        // O ID que será usado internamente
        }))
    });

    const novoStatus = await select({
        message: "Qual o novo status?",
        choices: [
            { name: " Quero ler", value: "quero_ler" },
            { name: " Lendo", value: "lendo" },
        ]
    });

    // find() = procura e retorna o livro que tem o mesmo ID que foi selecionado
    const livro = livros.find(l => l.id === livroSelecionado);
    livro.status = novoStatus; // Atualiza o status para o novo valor escolhido

    console.log("✅ Status atualizado com sucesso!");
    await salvarLivros(); // Salva as mudanças no arquivo JSON

}

// Função que ATUALIZA em qual página você está lendo
const atualizarProgresso = async () => {
    if (livros.length === 0) {
        console.log("❌ Nenhum livro cadastrado!");
        return;
    }

    // Pega só os livros que estão com status "lendo" (livros em andamento)
    const lendo = livros.filter(l => l.status === "lendo");

    if (lendo.length === 0) {
        console.log("📖 Nenhum livro em leitura no momento.");
        return;
    }

    console.log(`\n✨ Atualize seu Progresso de Páginas ✨\n`);

    // Escolhe o livro em leitura
    const livroSelecionado = await select({
        message: "Escolha o livro que você está lendo:",
        choices: lendo.map(l => ({
            name: `${l.titulo} (páginas: ${l.paginaAtual}/${l.paginas})`,
            value: l.id
        }))
    });

    //Encontra o livro completo usando o ID que foi selecionado
    const livro = livros.find(l => l.id === livroSelecionado);
    if (!livro) {
        console.log("❌ Livro não encontrado.");
        return;
    }

    // Garante que o total de páginas seja um número válido
    const totalPaginas = Number(livro.paginas);
    // isNaN = "is Not a Number" (verifica se NÃO é um número)
    if (Number.isNaN(totalPaginas) || totalPaginas <= 0) {
        console.log("⚠️ Total de páginas inválido no cadastro.");
        return;
    }

    const novaPaginaInput = await input({
        message: "📄 Em qual página você parou?"
    });

    // Converte o texto digitado para número
    let novaPagina = Number(novaPaginaInput);
    
    // Verifica se a página informada não ultrapassa o total de páginas do livro
    if (novaPagina > totalPaginas) {
        console.log(`⚠️ Número de páginas lidas não pode ser maior que o total do livro (${totalPaginas}).`);
        return; // Para a função se digitou um número maior que o total
    }

    // Verifica se terminou de ler o livro 
    if (novaPagina >= totalPaginas) {
        livro.paginaAtual = totalPaginas;    // Define como a última página
        livro.status = "lido";                // Muda o status para "lido"
        livro.dataFim = new Date().toLocaleString(); // Registra quando terminou
        console.log(`🎉 Parabéns! Você concluiu "${livro.titulo}" em ${livro.dataFim}.`);
    } else {
        // Se ainda não terminou, apenas atualiza a página atual
        livro.paginaAtual = novaPagina;
        console.log(`📖 Progresso atualizado: página ${livro.paginaAtual} de ${totalPaginas}`);
    }
    
    // Se o livro foi marcado como lido, pede uma avaliação
    if (livro.status === "lido") {
        let avaliacao;

        // while(true) = repete até receber um break (avaliação válida)
        while (true) {
            const avaliacaoEstrelas = await input({
                message: "De 1 a 5 estrelas, quanto você avalia esse livro?"
            });

            avaliacao = parseInt(avaliacaoEstrelas); // Converte texto para número

            // Verifica se a nota está entre 1 e 5
            if (avaliacao >= 1 && avaliacao <= 5) {
                livro.avaliacao = avaliacao; // Salva a avaliação
                console.log(`⭐ Você avaliou "${livro.titulo}" com ${avaliacao} estrela(s)!`);
                break; // Para o loop quando a avaliação for válida
            } else {
                console.log("⚠️ Avaliação inválida. Digite um número entre 1 e 5.");
                // Continua no loop pedindo uma nova avaliação
            }
        }

        await salvarLivros(); // Salva todas as mudanças no arquivo JSON
    }

}
// Função que CALCULA e MOSTRA estatísticas sobre seus livros lidos
const estatisticas = async () => {
    // 1️⃣ Verifica se existem livros cadastrados
    if (!Array.isArray(livros) || livros.length === 0) {
        console.log("⚠️ Não existem livros cadastrados para gerar estatísticas!");
        return;
    }

    console.log(`\n✨ Estátisticas Literárias ✨\n`);

    // 2️⃣ Pega só os livros que foram completamente lidos
    const lidos = livros.filter(l => l.status === "lido" && l.dataFim);

    if (lidos.length === 0) {
        console.log("⚠️ Nenhum livro foi concluído ainda!");
        return;
    }

    // 3️⃣ Conta quantos livros foram lidos em cada mês
    const livrosPorMes = {}; // Objeto vazio que vai armazenar: { "01/2025": 3, "02/2025": 5 }
    lidos.forEach(l => {
        let data;

        try {
            // Separa a data da hora (ex: "08/10/2025, 18:00" vira "08/10/2025")
            const [parteData] = l.dataFim.split(',');
            // Separa dia, mês e ano e converte cada um para número
            const [dia, mes, ano] = parteData.trim().split('/').map(Number);

            if (!dia || !mes || !ano) throw new Error("Formato inválido");
            data = new Date(ano, mes - 1, dia); // Cria um objeto de data (mês -1 porque começa em 0)
        } catch {
            console.log(`⚠️ Data inválida em "${l.titulo}": ${l.dataFim}`);
            return; // Pula este livro se a data estiver errada
        }

        // Formata como "mm/yyyy" (ex: "01/2025")
        const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
        // Adiciona 1 ao contador desse mês (se não existir, começa com 0)
        livrosPorMes[mesAno] = (livrosPorMes[mesAno] || 0) + 1;
    });

    // 4️⃣ Descobre qual é o gênero favorito (baseado nas melhores avaliações)
    const generos = {}; // Vai armazenar dados de cada gênero
    lidos.forEach(l => {
        if (!l.genero) return; // Pula se não tiver gênero
        // Se esse gênero ainda não existe no objeto, cria ele
        if (!generos[l.genero]) generos[l.genero] = { count: 0, totalAvaliacao: 0 };
        generos[l.genero].count++; // Adiciona 1 ao contador de livros desse gênero
        generos[l.genero].totalAvaliacao += l.avaliacao || 0; // Soma a avaliação
    });

    // Calcula a média de avaliação de cada gênero e ordena do melhor para o pior
    const generoFavorito = Object.entries(generos) // Transforma objeto em array
        .map(([genero, data]) => ({
            genero,
            count: data.count,
            mediaAvaliacao: data.totalAvaliacao / data.count // Calcula a média
        }))
        .sort((a, b) => b.mediaAvaliacao - a.mediaAvaliacao || b.count - a.count)[0] || null;
        // sort() = ordena do maior para o menor

    // 5️⃣ Conta o total de livros lidos
    const totalLidos = lidos.length;

    // 6️⃣ Calcula quantas páginas você lê em média por livro
    const mediaPaginas = totalLidos
        ? lidos.reduce((acc, l) => acc + Number(l.paginas), 0) / totalLidos
        // reduce() = soma todas as páginas de todos os livros
        : 0;

    const mediaPaginasArredondada = Math.round(mediaPaginas * 10) / 10; // Arredonda para 1 casa decimal

    // 7️⃣ Mostra todas as estatísticas no console
    console.log("\nEstatísticas de leitura:");
    console.log("Total de livros lidos:", totalLidos);
    console.log("Média de páginas por livro:", mediaPaginasArredondada);
    console.log("Livros por mês:", livrosPorMes);
    console.log("Gênero favorito:", generoFavorito ? `${generoFavorito.genero} (média: ${generoFavorito.mediaAvaliacao.toFixed(1)}, 
    quantidade: ${generoFavorito.count})` : "Nenhum");

    return { livrosPorMes, generoFavorito, totalLidos, mediaPaginas: mediaPaginasArredondada };

};

// Função que MOSTRA os livros que você mais gostou (avaliou com 4 ou 5 estrelas)
const recomendacaoBook = async () => {
    if (livros.length === 0) {
        console.log("❌ Nenhum livro cadastrado!");
        return;
    }

    // Filtra só os livros que você terminou E avaliou com 4 ou 5 estrelas
    const recomendados = livros.filter(l =>
        l.status === "lido" && (l.avaliacao === 4 || l.avaliacao === 5)
    );

    if (recomendados.length === 0) {
        console.log("📭 Você ainda não avaliou nenhum livro com 4 ou 5 estrelas.");
        return;
    }

    console.log(`\n✨ Suas recomendações Literárias ✨\n`);

    // Mostra cada livro recomendado com suas informações
    recomendados.forEach((l, index) => {
        console.log(`${index + 1}. "${l.titulo}" — ${l.autor} ⭐ ${l.avaliacao}/5`);
    });

    console.log(`\nTotal de recomendações: ${recomendados.length}\n`);
};

// Função que REMOVE livros do sistema
const deletarLivros = async () => {

    if (livros.length == 0) {
        console.log("Não existem livros para deletar!");
        return;
    }

    // Prepara uma lista de opções com checkbox (você pode marcar vários)
    const escolhas = livros.map(l => ({
        name: `${l.titulo} — ${l.autor}`, // O que aparece na tela para o usuário
        value: l.id                        // O ID que será usado para identificar qual deletar
    }));

    // Mostra checkboxes para o usuário marcar quais livros quer deletar
    const itensADeletar = await checkbox({
        message: "Selecione um livro para deletar",
        choices: escolhas,
        instructions: false,
    });

    // Se não marcou nenhum livro, não faz nada
    if (itensADeletar.length == 0) {
        console.log("Nenhum livro para deletar!");
        return;
    }

    // filter com ! = fica só com os livros que NÃO estão na lista para deletar
    // includes() = verifica se o ID está na lista de itens para deletar
    livros = livros.filter(l => !itensADeletar.includes(l.id));

    console.log("Livro(s) deletado(s) com sucesso!");

}
// Função PRINCIPAL que inicia o programa
const start = async () => {
    await carregarLivros(); // Primeiro: carrega os livros salvos do arquivo JSON

    // while(true) = loop infinito, o menu fica aparecendo até você escolher "Sair"
    while (true) {
        await salvarLivros() // Salva os dados a cada volta do loop

        // Mostra o menu principal com todas as opções
        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar Livro",       // O que aparece na tela
                    value: "cadastrar"             // Valor usado no switch
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
                    name: "Recomendação de Livros",
                    value: "recomendação"
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

        // switch = verifica qual opção foi escolhida e executa a função correspondente
        switch (opcao) {
            case "cadastrar":
                await cadastrarLivro();      // Chama a função de cadastrar
                break;                       // Para aqui e volta pro menu
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
            case "recomendação":
                await recomendacaoBook(); 
                break;
            case "deletar": 
                await deletarLivros(); 
                break;
            case "sair":
                console.log("👋 Até a próxima!");
                return;
        }
    }

};
start();

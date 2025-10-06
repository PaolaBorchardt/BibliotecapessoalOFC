const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require('fs').promises;
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


    console.log(`Livro cadastrado com sucesso! ${titulo}`)

    livros.push({
        id: randomUUID(),
        titulo: titulo,
        autor: autor,
        paginas: paginas,
        genero: genero,
        status: `quero_ler`,  // status inicial
        paginaAtual: 0,
        avaliacao: null,
        dataInicio: null,
        dataFim: null
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
        console.log(`${index + 1}. ${l.titulo} — ${l.autor} - ${l.paginas} (${l.genero})`);
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
            { name: " Lido", value: "lido" }
        ]
    });

    //Ptocura no array de livros - seleciona - novo status
    const livro = livros.find(l => l.id === livroSelecionado);
    livro.status = novoStatus;

    // Se marcar como lido, pode pedir avaliação
    if (novoStatus === "lido") {
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
    }


    console.log("✅ Status atualizado com sucesso!");
    await salvarLivros(); // salva no JSON
}

const deletarLivros = async () => { //Tá dando erro 
    
    if(livros.length == 0) {
        console.log = ("Não existem livros para deletar!");
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

     console.log= ("Livro(s) deletado(s) com sucesso!");

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
            case "deletar":
                await deletarLivros();
                break;
            case "sair":
                console.log("Até a próxima!");
                return;
        }
    }
}

start();
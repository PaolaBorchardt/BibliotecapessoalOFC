const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require('fs').promises;

let livros = []

const salvarLivros = async () => {
    await fs.writeFile("livros.json", JSON.stringify(livros, null, 2));
}

const cadastrarLivro = async () => {
    const titulo = await input({ message: "Digite o título:" });
    const autor = await input({ message: "Digite o autor:" });
    const paginas = await input({ message: "Digite a quantidade de páginas:" });
    const genero = await input({ message: "Digite o gênero:" });
    

    if (titulo.length === 0 && autor.length === 0 && paginas.length === 0 && genero.length === 0) {
        console.log('Todos os campos devem ser preenchdos.');
        return;
    }
    

    console.log(`Livro cadastrado com sucesso! ${titulo}`)

    livros.push({ 
            titulo: titulo, 
            autor: autor, 
            paginas: paginas, 
            genero: genero, 
            checked: false,

        });
}



const start = async () => {

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
                    name: "Sair",
                    value: "sair"
                }
            ]
        });

        switch (opcao) {
            case "cadastrar":
                await cadastrarLivro();
                break;
            case "sair":
                console.log('Até a próxima!');
                return;
        }
    }
}

start();
# 📚 Biblioteca Pessoal

## 📝 Descrição  

Aplicativo de terminal desenvolvido em **Node.js** para **gerenciar sua biblioteca pessoal**, acompanhar o progresso de leitura, avaliar livros e gerar estatísticas personalizadas.  
Permite cadastrar obras, registrar páginas lidas, atribuir avaliações e visualizar recomendações com base nas suas notas.  

---

## ⚙️ Funcionalidades  

- [x] **Cadastrar Livro** – Adiciona novos livros com validações (título, autor, páginas e gênero)  
- [x] **Lista de Desejos** – Mostra os livros que você quer ler futuramente  
- [x] **Atualizar Status** – Permite marcar livros como `quero_ler` ou `lendo` e fazer alguma alteraçã nos livros marcados como `lido` (ex: gostaria de ler novamente - Pode voltar para o status `quero_ler` ou `lendo`).
- [x] **Atualizar Progresso** – Registra a página atual, data de início e conclusão  
- [x] **Avaliação com Estrelas** – Ao finalizar o livro (`lido`), o usuário atribui de 1 a 5 estrelas  
- [x] **Estatísticas Literárias** – Mostra total de livros lidos, média de páginas, gênero favorito e livros por mês  
- [x] **Recomendações** – Sugere livros com nota 4⭐ ou 5⭐  
- [x] **Excluir Livros** – Permite deletar itens selecionados  
- [x] **Persistência de Dados** – Todas as informações ficam salvas em `livros.json`  
- [x] **Menu Interativo e Mensagens de Feedback**  

---

## ▶️ Como Executar  

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/PaolaBorchardt/BibliotecapessoalOFC.git
   
2. **Instale as dependências:**

    npm install @inquirer/prompts

3. **Execute o app:**

    node index.js.

## 💡 Tecnologias Utilizadas

- **Node.js** – Ambiente de execução
- **@inquirer/prompts** – Criação do menu interativo
- **fs.promises** – Manipulação de arquivos JSON
- **crypto.randomUUID()** – Geração de IDs únicos
- **JSON** – Estrutura dos dados persistentes
- **async/await** – Controle assíncrono de fluxos

## 🖼️ Capturas de Tela

(Insira aqui prints do terminal mostrando o menu e as estatísticas do app funcionando)

---

## 👩‍💻 Autor

**Paola Beatriz Borchardt**  
📧 [paola_borchardt@estudante.sesisenai.org.br]  
💬 Desenvolvido como exercício prático de lógica e manipulação de dados com Node.js.

---

## 🧠 Aprendizados

Durante o desenvolvimento deste projeto, aprendi a:

- Criar aplicações de terminal com Node.js.  
- Trabalhar com `async/await` e `fs.promises` para ler e escrever arquivos JSON.  
- Implementar menus interativos usando `@inquirer/prompts`.  
- Manipular objetos JavaScript e persistir dados localmente.  
- Tratar erros e validar dados de forma eficiente.  
- Estruturar um projeto com múltiplas funcionalidades e fluxo contínuo de usuário.

## 🧩 Estrutura de Dados

Cada livro é armazenado em `livros.json` no seguinte formato:

```json
{
  "id": "a1b2c3d4-5678-9101-1121-314151617181",
  "titulo": "O Senhor dos Anéis",
  "autor": "J.R.R. Tolkien",
  "paginas": 1200,
  "genero": "Fantasia",
  "status": "lendo",
  "paginaAtual": 523,
  "avaliacao": 5,
  "dataInicio": "06/10/2025, 18:30:12",
  "dataFim": "09/10/2025, 22:15:04"
}

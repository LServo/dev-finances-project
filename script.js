const $ = document.querySelector.bind(document) // bind(document) é uma função que permite acessar o documento

const Modal = {
  open() {
    const modalOverlay = $('.modal-overlay')

    modalOverlay.classList.add('active')
  },
  close() {
    const modalOverlay = $('.modal-overlay')

    modalOverlay.classList.remove('active')
  }
}
// essas funções podem ser substituídas pelo toggleClass

const Storage = {
  get() {
    // retorna todas as transações do localStorage
    const transactions = localStorage.getItem('transactions') // getItem(transactions) é um método do localStorage que retorna o valor de uma chave
    return transactions ? JSON.parse(transactions) : [] // se não existir nada no localStorage, retorna um array vazio
  },
  set(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions)) // converte o array em string e salva no localStorage
  }
}

const Transaction = {
  all: Storage.get(),
  // igual significa "atribuindo"

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1) // remove 1 elemento a partir do index

    App.reload()
  },

  incomes() {
    let income = 0
    // pegar todas as transações

    //para cada transação
    Transaction.all.forEach(transaction => {
      // se ela for maior que zero
      if (transaction.amount > 0) {
        //somar à variável income
        income += transaction.amount
      }
    })
    // retornar a variável income
    return income
  },

  expenses() {
    let expense = 0

    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const DOM = {
  // cria métodos para manipular o DOM
  transactionsContainer: $('#data-table tbody'),

  addTransaction(transaction, index) {
    // recebe uma transação e um índice
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    // recebe uma transação
    const classCSS = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${classCSS}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" style="cursor:pointer" src="./assets/minus.svg" alt="Remover Transação" />
    </td>
    `
    return html
  },

  updateBalance() {
    // atualiza o balanço
    $('#incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())

    $('#expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    )

    $('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearAll() {
    DOM.transactionsContainer.innerHTML = '' // limpa o conteúdo do elemento
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '' // se o valor for menor que zero, retorna um sinal de menos
    value = String(value).replace(/\D/g, '') // ache tudo que não for um número e substitua por nada
    // o g significa que vai procurar por todos os caracteres e não apenas parar no primeiro que encontrar
    // o \D significa que não é um número

    value = Number(value) / 100 // transforma em float
    value = value.toLocaleString('pt-BR', {
      // formata o valor
      style: 'currency', // formata como moeda
      currency: 'BRL' // formata como R$
    })
    return signal + value // retorna o valor formatado
  },

  formatAmount(value) {
    value = String(value).replace(/\,\./g, '') // substitui a vírgula por nada e o ponto por nada
    value = Number(value) * 100
    return value
  },

  formatDate(date) {
    const splittedDate = date.split('-') // separa a data em um array

    // const day = date.getDate()
    // const month = date.getMonth() + 1
    // const year = date.getFullYear()

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}

const Form = {
  // cria um objeto para manipular o formulário
  description: $('input#description'),
  amount: $('input#amount'),
  date: $('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues() // pega os valores do formulário e armazena em um objeto chamado values

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Preencha todos os campos')
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues() //(desestrutura o objeto Form.getValues() e atribui às variáveis description, amount e date)

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description, // atribui a description ao valor da variável description
      amount, // atribui a amount ao valor da variável amount
      date // atribui a date ao valor da variável date
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    // recebe um evento do formulário
    event.preventDefault() // impede o comportamento padrão do formulário

    // tenta executar o código abaixo e se algum falhar ele vai para o catch
    try {
      // validar se todas as informações foram preenchidas
      Form.validateFields()
      // formatar os dados para salvar
      const transaction = Form.formatValues()
      // salvar
      Transaction.add(transaction)
      // apagar os dados do formulário (limpar)
      Form.clearFields()
      // fechar modal
      Modal.close()
      // atualizar app
      //App.reload() // não precisa porque já tem um app reload no add transaction
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    //   // inicializa a aplicação
    //   Transaction.all.forEach((transaction, index) => {
    //   // para cada transação
    //   DOM.addTransaction(transaction, index) // adiciona a transação na tabela
    Transaction.all.forEach(DOM.addTransaction) // adiciona a transação na tabela
    // o forEach é um método do array que recebe uma função como parâmetro e executa essa função para cada elemento do array
    // como o método addTransaction recebe uma transação e um índice, podemos passar o índice como parâmetro
    // como os valores são iguais, não precisamos passar o índice como parâmetro para o método addTransaction pois ele já está no parâmetro da função addTransaction (transaction, index) => { ... }
    // por isso podemos passar apenas a transação e o método addTransaction vai pegar o índice automaticamente e adicionar na tabela como parâmetro da função addTransaction (transaction) => { ... } ou (transaction, index) => { ... }
    // ou seja estamos utilizando o método addTransaction como um método estático, ou seja, não precisamos instanciar a classe Transaction para utilizar o método addTransaction, isso se chama atalho de método estático (static) ou método de classe (class method) e é muito utilizado em frameworks como Angular e React para que possamos utilizar o método addTransaction sem instanciar a classe Transaction
    // utilizando como atalho não precisamos executar

    DOM.updateBalance() // atualiza o balanço

    Storage.set(Transaction.all) // salva as transações no localStorage
  },
  reload() {
    DOM.clearAll() // limpa todas as transações
    App.init() // recarrega as transações
  }
}

// [
//   {
//     description: 'Luz',
//     amount: -50000,
//     date: '23/01/2021'
//   },
//   {
//     description: 'Criação Website',
//     amount: 500000,
//     date: '23/01/2021'
//   },
//   {
//     description: 'Internet',
//     amount: -20000,
//     date: '23/01/2021'
//   }
// ]

App.init()

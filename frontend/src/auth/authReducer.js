const userKey = "_mymoney_user";  // chave para armazenar no local storage

// estado inicial para o component 
const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem(userKey)),
  validToken: false, // sempre que entrar na aplicação o token estará falso
};

// metodo que vai fazer a evolução, vai responder duas actions
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "TOKEN_VALIDATED": // se o payload vier verdadeiro vai retornar o estado
      if (action.payload) {
        return { ...state, validToken: true };
      } else {
        localStorage.removeItem(userKey);
        return { ...state, validToken: false, user: null };
      }
    case "USER_FETCHED":
      localStorage.setItem(userKey, JSON.stringify(action.payload));
      return { ...state, user: action.payload, validToken: true };
    default:
      return state;
  }
};

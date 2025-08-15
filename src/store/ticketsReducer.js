// utils/ticketsReducer.js
export const initialState = {
  tickets: [],
  agents: [],
  error: null,
};

export const ticketReducer = (state, action) => {
  switch (action.type) {

    case 'SET_TICKETS':
      return {
        ...state,
        tickets: action.payload,
        error: null,
      };


    case 'UPD_TICKET': {

      const { id } = action.payload;
      let changed = false;

      //console.log('ticket del backend:', action.payload);
      const nextTickets = state.tickets.map(t => {
        if (t.id !== id) return t;

        const merged = { ...t, ...action.payload };

        // Si NO vino en el payload, lo eliminamos manualmente
        if (!('linked_patient_snapshot' in action.payload)) {
          delete merged.linked_patient_snapshot;
        }

        //console.log('ticket actualizado:', merged);
        if (shallowEqual(t, merged)) return t;
        changed = true;
        return merged;
      });

      if (!changed) return state;
      return { ...state, tickets: nextTickets };
    }



    //agents
    case 'SET_AGENTS':
      console.log("Configurando agentes:", action.payload); 
      return {
        ...state,
        agents: action.payload,
        error: null,
      };


    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    

    default:
      return state;
  }
};



function shallowEqual(objA, objB) {
  if (objA === objB) return true;

  if (
    typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (!objB.hasOwnProperty(key) || objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}

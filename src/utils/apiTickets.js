// ticketUtils.js
import { ENDPOINT_URLS } from "../utils/js/constants";

export const fetchTableData = async () => {

    const response = await fetch(`${ENDPOINT_URLS.API}/cosmoGetQuality`);
    //validate json output
    if(response.status === 204) return { success: true, message: [] }; // No content
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error fetching tickets');
    return data;
  
};

//phone calls history
export const phoneHistory = async (dispatch, setLoading, phoneNumber) => {
  try {
    const response = await fetch(`${ENDPOINT_URLS.API}/cosmoGetPhoneHistory?phone=${encodeURIComponent(phoneNumber)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error fetching calls history');
    }
    
    return { success: true, message: data.items || 'Updated successfully' };
  } catch (err) {
    const message = err.message || 'Something went wrong';
    dispatch({ type: 'SET_ERROR', payload: message });
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};


//update agent_assigned
// assign agent to a ticket
export const changeStatus = async (dispatch, setLoading, ticketId, newStatus) => {
  try {
    const response = await fetch(`${ENDPOINT_URLS.API}/cosmoUpdateStatusQuality`, {
      method: "PATCH",
      body: JSON.stringify({
        ticketId: ticketId,
        newStatus: newStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar el estado');
    }

    return { success: true, message: data };
  } catch (err) {
    const message = err.message || 'Something went wrong';
    dispatch({ type: 'SET_ERROR', payload: message });
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};


// add agent note to ticket
export const addNotes = async (dispatch, setLoading, ticketId, note) => {
  try {
    const response = await fetch(`${ENDPOINT_URLS.API}/cosmoUpdateNotesQuality`, {
      method: "PATCH",
      body: JSON.stringify({
        ticketId: ticketId,
        notes: note,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error updating notes');
    }

    return { success: true, message: data };
  } catch (err) {
    const message = err.message || 'Something went wrong';
    dispatch({ type: 'SET_PATIENT_NAME_ERROR', payload: message });
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};


// add agent note to ticket
export const addQcData = async (dispatch, setLoading, ticketId, { rubric, outcome, score }) => {
  console.log(ticketId, { rubric, outcome, score });
  try {
    const response = await fetch(`${ENDPOINT_URLS.API}/cosmoUpsertQc`, {
      method: "PATCH",
      body: JSON.stringify({
        ticketId,
        rubric,
        outcome,
        score,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error updating notes');
    }

    return { success: true, message: data };
  } catch (err) {
    const message = err.message || 'Something went wrong';
    dispatch({ type: 'SET_PATIENT_NAME_ERROR', payload: message });
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};




export const searchTickets = async ({ query, page, size, filter }, accessToken) => {
  //if (accessToken === null) return { success: false, message: 'No access token provided' };
    let url = `${ENDPOINT_URLS.API}/searchTicketsQuality`;
    try {
        const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
      query,
      page,
      size,
      ...(filter ? { filter } : {})
    }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching tickets');
        }
        // Devuelve solo los datos
        return { success: true, message: data || 'Updated successfully' };
    } catch (err) {
        const message = err.message || 'Something went wrong';
        return { success: false, message };
    }
};


export const getTicketById = async (ticketId, accessToken=null) => {
  //if (accessToken === null) return { success: false, message: 'No access token provided' };
    let url = `${ENDPOINT_URLS.API}/cosmoGetByIds`;
    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          // Authorization: `Bearer ${accessToken}`, si usas autenticación
          },
          body: JSON.stringify({
            ticketIds: ticketId ? [ticketId] : []
          }),
          });
          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.message || 'Error fetching tickets');
          }
          // Devuelve solo los datos
          return { success: true, message: data || 'Updated successfully' };
    } catch (err) {
        const message = err.message || 'Something went wrong';
        return { success: false, message };
    }
};


// ticketUtils.js
export const fetchTableData = async (agentAssigned) => {
 
    const response = await fetch(`https://cservicesapi.azurewebsites.net/api/cosmoGetQuality?agent_assigned=${encodeURIComponent(agentAssigned)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error fetching tickets');
    return data;
  
};

//phone calls history
export const phoneHistory = async (dispatch, setLoading, phoneNumber) => {
  try {
    const response = await fetch(`https://cservicesapi.azurewebsites.net/api/cosmoGetPhoneHistory?phone=${encodeURIComponent(phoneNumber)}`);
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
export const changeStatus = async (dispatch, setLoading, ticketId, currentAgentEmail, newStatus) => {
  try {
    const response = await fetch(`https://cservicesapi.azurewebsites.net/api/cosmoUpdateStatusQuality`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketId: ticketId,
        agent_email: currentAgentEmail,
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
export const addNotes = async (dispatch, setLoading, ticketId, currentAgentEmail, note) => {
  try {
    const response = await fetch(`https://cservicesapi.azurewebsites.net/api/cosmoUpdateNotesQuality`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketId: ticketId,
        agent_email: currentAgentEmail,
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




export const searchTickets = async ({ query, page, size, filter }, accessToken) => {
  //if (accessToken === null) return { success: false, message: 'No access token provided' };
    let url = `https://cservicesapi.azurewebsites.net/api/searchTicketsQuality`;
    try {
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        // Authorization: `Bearer ${accessToken}`, si usas autenticación
        },
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
    let url = `https://cservicesapi.azurewebsites.net/api/cosmoGetByIds`;
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


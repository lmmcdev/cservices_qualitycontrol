// ticketUtils.js

//statistics
export const getPatients = async ({params}, accessToken) => {
  //if (accessToken === null) return { success: false, message: 'No access token provided' };
    const token = params.continuationToken;
    let tokenCosmos = ''
    let url = `https://cservicesapi.azurewebsites.net/api/cosmoGetPatients`;
    if (params.continuationToken) {
      tokenCosmos = token;
    }

    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          // Authorization: `Bearer ${accessToken}`, si usas autenticación
          },
          body: JSON.stringify({
              limit: params.limit,
              continuationToken: tokenCosmos,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
        throw new Error(data.message || 'Error fetching tickets');
        }

        // Devuelve solo los datos
        return { success: true, message: data.message || 'Updated successfully' };
    } catch (err) {
        const message = err.message || 'Something went wrong';
        return { success: false, message };
    }
};


export const searchPatients = async (query, filter, page = 1, size = 50, accessToken) => {
  //if (accessToken === null) return { success: false, message: 'No access token provided' };
    let url = `https://cservicesapi.azurewebsites.net/api/searchPatients`;
    try {
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        // Authorization: `Bearer ${accessToken}`, si usas autenticación
        },
        body: JSON.stringify({
            query,
            filter,
            page,
            size,
        }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching tickets');
        }
        // Devuelve solo los datos
        return {
          success: true,
          message: {
            items: data.hits || [],
            continuationToken: data.continuationToken || null,
          },
        };
  } catch (err) {
    const message = err.message || 'Something went wrong';
    return { success: false, message };
  }
};


//statistics
export const getTicketsByPatientId = async (patientId, limit = 10, continuationToken = null, accessToken = null) => {
  if (!patientId) return { success: false, message: 'patientId is required' };

  const url = `https://cservicesapi.azurewebsites.net/api/searchTickets`;
  const query = `${patientId}`;
  let page = 1;
  let size = 50;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        query,
        page,
        size // se envía si existe
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error fetching tickets');
    }

    // Retorno esperado: items y token para la paginación
    return {
      success: true,
      message: {
        items: data.value || [],
        continuationToken: data.continuationToken || null,
      },
    };
  } catch (err) {
    return { success: false, message: err.message || 'Something went wrong' };
  }
};

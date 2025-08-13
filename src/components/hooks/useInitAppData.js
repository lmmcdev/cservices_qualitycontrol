// useInitAppData.js
import { useEffect } from 'react';
import { useTickets } from "../../context/ticketsContext";
import { useLoading } from "../../providers/loadingProvider";
import { fetchTableData } from "../../utils/apiTickets";
import { useNavigate } from 'react-router-dom';


export const useInitAppData = () => {
  const { dispatch: ticketDispatch } = useTickets();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const tickets = await fetchTableData();
        ticketDispatch({ type: 'SET_TICKETS', payload: tickets.message });
      } 
      catch(err) {
        console.log(err);
        navigate('/404');
      }
      finally {
        setLoading(false);
      }
    };
    //if (user?.username) load();
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

import React, { useState } from 'react';
import SearchTicketDeep from './ticketsDeepSeacrh';
import { handlerGetTicketByIds } from '../../../utils/js/ticketActions';
import DialogFullScreenRouter from '../../dialogs/dialogFullScreenRouter';

const TicketSearchContainer = () => {
  const [open, setOpen] = useState(false);
  const [ticketSelected, setSelectedTicket] = useState({})

  const onClose = () => {
    setOpen(false)
  }

  const onSelectFunc = async (ticket) => {
    if (!ticket?.id) return;
    const result = await handlerGetTicketByIds(ticket.id);
    if (!result) return;

    const ticketSelected = result.message?.message.items[0];
    setSelectedTicket(ticketSelected)
    // Guarda el ticket en state si quieres, o pásalo por location.state
    setOpen(true);
  };

  return (
    <div>
      <SearchTicketDeep onSelect={onSelectFunc} />
      <DialogFullScreenRouter open={open} onClose={onClose} ticket={ticketSelected} />
    </div>
  );
};

export default TicketSearchContainer;

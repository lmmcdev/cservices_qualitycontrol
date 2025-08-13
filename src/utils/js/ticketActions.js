// utils/ticketActions.js
import {
  changeStatus,
  addNotes,
  getTicketById
} from '../apiTickets';

export async function handleStatusChange({ dispatch, setLoading, ticketId, newStatus, setStatus, setSuccessMessage, setErrorMessage, setSuccessOpen, setErrorOpen }) {
  setLoading(true);
  const result = await changeStatus(dispatch, setLoading, ticketId, newStatus);
  if (result.success) {
    setSuccessMessage('This ticket start to be monitored from now');
    setStatus(newStatus);
    setSuccessOpen(true);
  } else {
    setErrorMessage(result.message);
    setErrorOpen(true);
  }

  return result
}

export async function handleAddNoteHandler({ dispatch, setLoading, ticketId, noteContent, setNotes, setNoteContent, setOpenNoteDialog, setSuccessMessage, setSuccessOpen, setErrorMessage, setErrorOpen }) {
  if (!noteContent.trim()) return;
  const newNote = [{
    event_type: 'quality_note',
    event: noteContent.trim(),
    datetime: new Date().toISOString()
  }];
  const result = await addNotes(dispatch, setLoading, ticketId, newNote);
  if (result.success) {
    //setNotes((prev) => [...prev, ...newNote]);
    setNoteContent('');
    setOpenNoteDialog(false);
    setSuccessMessage("QA Note added successfully");
    setSuccessOpen(true);
  } else {
    setErrorMessage(result.message);
    setErrorOpen(true);
  }

  return result;
}



export async function handlerGetTicketByIds(ticket, accessToken) {
  
  return await getTicketById(ticket, accessToken);
}
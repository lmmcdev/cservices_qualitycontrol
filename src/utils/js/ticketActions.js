// utils/ticketActions.js
import {
  changeStatus,
  addNotes,
  getTicketById
} from '../apiTickets';

export async function handleStatusChange({ dispatch, setLoading, ticketId, agentEmail, newStatus, setStatus, setSuccessMessage, setErrorMessage, setSuccessOpen, setErrorOpen }) {
  setLoading(true);
  const result = await changeStatus(dispatch, setLoading, ticketId, agentEmail, newStatus);
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

export async function handleAddNoteHandler({ dispatch, setLoading, ticketId, agentEmail, noteContent, setNotes, setNoteContent, setOpenNoteDialog, setSuccessMessage, setSuccessOpen, setErrorMessage, setErrorOpen }) {
  if (!noteContent.trim()) return;
  const newNote = [{
    agent_email: agentEmail,
    event_type: 'user_note',
    content: noteContent.trim(),
    datetime: new Date().toISOString()
  }];
  const result = await addNotes(dispatch, setLoading, ticketId, agentEmail, newNote);
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

  console.log(result)
  return result;
}



export async function handlerGetTicketByIds(ticket, accessToken) {
  
  return await getTicketById(ticket, accessToken);
}
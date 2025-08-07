// src/pages/tableTickets.jsx

import React, { useEffect, useState } from 'react';
//import { useLoading } from '../providers/loadingProvider.jsx';
//import { useAuth } from '../context/authContext.js';
import { useTickets } from '../context/ticketsContext.js';
import {
  Box,
  Chip,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip
} from '@mui/material';
import { icons } from '../components/auxiliars/icons.js';
//import { useNavigate } from 'react-router-dom';
import { useFilters } from '../context/filterContext.js';
import { emailToFullName } from '../utils/js/emailToFullName.js';
import StatusFilterBoxes from '../components/statusFilterBoxes';
import { SortAscending, SortDescending } from 'phosphor-react';
import { getStatusColor } from '../utils/js/statusColors.js';
import SuspenseFallback from '../components/auxiliars/suspenseFallback.js';
import { TicketIndicators } from '../components/ticketIndicators';
import { useInitAppData } from '../components/hooks/useInitAppData';
import DialogFullScreenRouter from '../components/dialogs/dialogFullScreenRouter.js';
import { handlerGetTicketByIds } from '../utils/js/ticketActions.js';

export default function TableTickets() {
  useInitAppData();
  const { filters } = useFilters();
  const { state } = useTickets();
  //const { setLoading } = useLoading();
  //const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('Total');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ticketSelected, setSelectedTicket] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');
  const [open, setOpen] = useState(false);


  useEffect(() => {
    setPage(0);
  }, [selectedStatus]);


  const validTickets = Array.isArray(state.tickets) ? state.tickets : [];
  const filteredRows = validTickets.filter((row) => {
    const matchStatus = selectedStatus === 'Total' || row.status === selectedStatus;
    const matchAgent =
      filters.assignedAgents.length === 0 || filters.assignedAgents.includes(row.agent_assigned);
    const matchCaller =
      filters.callerIds.length === 0 || filters.callerIds.includes(row.caller_id);
    const matchDate =
      !filters.date || row.creation_date?.startsWith(filters.date);
    const matchDepartment =
      filters.assignedDepartment.length === 0 || filters.assignedDepartment.includes(row.assigned_department);
    return matchStatus && matchAgent && matchCaller && matchDate && matchDepartment;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    const dateA = new Date(a.creation_date);
    const dateB = new Date(b.creation_date);
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const ticketsCountByStatus = validTickets.reduce((acc, ticket) => {
    const status = ticket.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  ticketsCountByStatus.Total = filteredRows.length;

  const columnWidths = {
    status: 110,
    callerId: 120,
    name: 160,
    dob: 120,
    phone: 130,
    createdAt: 160,
    assignedTo: 160
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(-10);
    const parts = [];
    if (digits.length > 0) parts.push('(' + digits.slice(0, 3));
    if (digits.length >= 4) parts[0] += ') ';
    if (digits.length >= 4) parts.push(digits.slice(3, 6));
    if (digits.length >= 7) parts.push('-' + digits.slice(6, 10));
    return '+1 ' + parts.join('');
  };

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
  

  if (!Array.isArray(state.tickets) || state.tickets.length === 0) {
    return <SuspenseFallback />;
  }

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,
          position: 'fixed',
          top: 150,
          left: 220,
          right: 20,
          bottom: 20,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0px 8px 24px rgba(239, 241, 246, 1)',
          backgroundColor: '#fff',
        }}
      >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* FILTROS alineados con la tabla y con margen inferior extra */}
          <Box sx={{ flexShrink: 0, px: 4, pt: 4, pb: 2 }}>
            <StatusFilterBoxes
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              ticketsCountByStatus={ticketsCountByStatus}
            />
          </Box>

          {/* TABLA CON HEADERS FIJOS */}
          <Box sx={{ flex: 1, overflow: 'hidden', px: 4 }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: '100%',
                overflowY: 'auto',
                '& thead th': {
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#f6f7f9',
                  zIndex: 1,
                  boxShadow: '0px 2px 5px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: columnWidths.status, minWidth: columnWidths.status, fontWeight: 'bold' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ width: 100, fontWeight: 'bold' }}>
                      Flags
                    </TableCell>
                    <TableCell sx={{ width: columnWidths.callerId, minWidth: columnWidths.callerId, fontWeight: 'bold' }}>
                      Caller ID
                    </TableCell>
                    <TableCell sx={{ width: columnWidths.name, minWidth: columnWidths.name, fontWeight: 'bold' }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ width: columnWidths.dob, minWidth: columnWidths.dob, fontWeight: 'bold' }}>
                      DOB
                    </TableCell>
                    <TableCell sx={{ width: columnWidths.phone, minWidth: columnWidths.phone, fontWeight: 'bold' }}>
                      Phone
                    </TableCell>
                    <TableCell
                      sx={{
                        width: columnWidths.createdAt,
                        minWidth: columnWidths.createdAt,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                      <Box display="flex" alignItems="center">
                        Created At&nbsp;
                        {sortDirection === 'asc' ? (
                          <SortAscending size={20} weight="bold" style={{ marginLeft: 8 }} />
                        ) : (
                          <SortDescending size={20} weight="bold" style={{ marginLeft: 8 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: columnWidths.assignedTo, minWidth: columnWidths.assignedTo, fontWeight: 'bold' }}>
                      Assigned To
                    </TableCell>
                    <TableCell sx={{ width: 120, fontWeight: 'bold', textAlign: 'center' }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row, idx) => (
                    <TableRow key={row.id || idx} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(row.status, 'bg') || '#e0e0e0',
                            color: getStatusColor(row.status, 'text') || '#000',
                            fontWeight: 'bold',
                            fontSize: 12,
                            borderRadius: '16px',
                            '& .MuiChip-label': {
                              display: 'flex',
                              alignItems: 'center',
                              py: '4px',
                              px: '15px',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TicketIndicators ai_data={row.aiClassification} showTooltip iconsOnly />
                      </TableCell>
                      <TableCell>{row.caller_id}</TableCell>
                      <TableCell>{row.patient_name}</TableCell>
                      <TableCell>{row.patient_dob}</TableCell>
                      <TableCell>{row.phone ? formatPhone(row.phone) : 'N/A'}</TableCell>
                      <TableCell>{row.creation_date}</TableCell>
                      <TableCell>{emailToFullName(row.agent_assigned)}</TableCell>
                      <TableCell>
                        <Box display="flex" justifyContent="center" gap={1}>
                          {row.agent_assigned ? (
                            <Tooltip title="Edit">
                              <Box
                                sx={{
                                  backgroundColor: '#DFF3FF',
                                  color: '#00A1FF',
                                  borderRadius: '50%',
                                  p: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                  transition: 'background-color 0.3s',
                                  '&:hover': {
                                    backgroundColor: '#00A1FF',
                                    color: '#fff',
                                  },
                                }}
                                onClick={() => onSelectFunc(row)}
                              >
                                <icons.edit sx={{ fontSize: 16 }} />
                              </Box>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Not Assigned Yet">
                              <IconButton
                                
                                sx={{
                                  backgroundColor: '#daf8f4',
                                  color: '#00b8a3',
                                  borderRadius: '50%',
                                  p: 1,
                                  width: 32,
                                  height: 32,
                                  transition: 'background-color 0.3s',
                                  '&:hover': {
                                    backgroundColor: '#00b8a3',
                                    color: '#fff',
                                  },
                                }}
                              >
                                <icons.assignToMe size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Paginador */}
          <Box sx={{ flexShrink: 0, px: 4, py: 1, backgroundColor: '#fff' }}>
            <TablePagination
              component="div"
              count={filteredRows.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        </CardContent>
      </Card>

      <DialogFullScreenRouter  open={open} onClose={onClose} ticket={ticketSelected} />

    </>
  );
}

import { useEffect, useState } from 'react'
import { Container, TextField, Button, Typography, Stack, Select, MenuItem, Chip, Snackbar, Alert, CircularProgress } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'

type Claim = {
  claim_id: string
  user_id: string
  amount: number
  description?: string
  status: string
  created_at: string
}

export default function App() {
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [rows, setRows] = useState<Claim[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMsg, setSnackbarMsg] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingUpdateId, setLoadingUpdateId] = useState<string | null>(null)

  const handleSnackbarClose = () => setSnackbarOpen(false)

  async function fetchClaims() {
    const res = await fetch('/api/claims')
    const data: Claim[] = await res.json()
    setRows(data.map(d => ({ ...d, id: d.claim_id })))
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  async function submitClaim() {
    setLoadingSubmit(true)
    try {
      await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount, description })
      })
      setAmount(0)
      setDescription('')
      fetchClaims()
      setSnackbarMsg('Claim submitted successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch {
      setSnackbarMsg('Error submitting claim')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoadingSubmit(false)
    }
  }

  async function updateStatus(claimId: string, newStatus: string) {
    setLoadingUpdateId(claimId)
    try {
      await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchClaims()
      setSnackbarMsg(`Status updated to ${newStatus}`)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch {
      setSnackbarMsg('Error updating status')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoadingUpdateId(null)
    }
  }

  const getStatusChip = (status: string) => {
    const colorMap: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
    }
    return <Chip label={status} color={colorMap[status] || 'default'} size="small" />
  }

  const columns: GridColDef[] = [
    { field: 'claim_id', headerName: 'ID', flex: 1 },
    { field: 'user_id', headerName: 'User', width: 120 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => getStatusChip(params.row.status),
    },
    { field: 'description', headerName: 'Description', width: 120 },
    { field: 'created_at', headerName: 'Created', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <>
          <Select
            size="small"
            value={params.row.status}
            onChange={(e) => updateStatus(params.row.claim_id, e.target.value)}
            disabled={loadingUpdateId === params.row.claim_id}
          >
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
          {loadingUpdateId === params.row.claim_id && <CircularProgress size={18} style={{ marginLeft: 8 }} />}
        </>
      ),
    },
  ]

  return (
    <>
      <Container maxWidth="md">
        <Typography variant="h2" gutterBottom style={{ textAlign: 'center'}}>Mini Claims Tracker</Typography>

        <Stack direction="row" spacing={2} style={{ marginBottom: 16 }}>
          <TextField label="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
          <TextField label="Amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ flex: 1 }} />
          <Button variant="contained" onClick={submitClaim} disabled={loadingSubmit}>
            {loadingSubmit ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
          </Button>
        </Stack>

        <div style={{ height: 480, width: '100%' }}>
          <DataGrid rows={rows} columns={columns} />
        </div>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  )
}

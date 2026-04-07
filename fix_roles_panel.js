const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/modules/settings/SettingsDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start and end of RolesPanel
const startMarker = '// ─── Roles & Permissions ──────────────────────────────────────────────────────';
const endMarker = '// ─── Bank Accounts ────────────────────────────────────────────────────────────';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const newPanel = `// ─── Roles & Permissions ──────────────────────────────────────────────────────
// Props: isSuperuser = Django is_superuser; isSuperAdmin = SUPERADMIN role
function RolesPanel({ isSuperuser, isSuperAdmin }: { isSuperuser: boolean; isSuperAdmin: boolean }) {
  const qc = useQueryClient();

  // SUPERUSER: corporate dropdown to filter roles across all orgs
  const [selectedCorp, setSelectedCorp] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [form, setForm] = useState({ name: '', description: '', permission_ids: [] as number[] });
  const [err, setErr] = useState('');
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);

  // SUPERUSER only: fetch all corporates for the dropdown
  const { data: corpsData } = useQuery({
    queryKey: ['roles-corporates'],
    queryFn: () => roleService.listCorporates().then(r => r.data),
    enabled: isSuperuser,
  });
  const corporates = corpsData?.corporates ?? [];

  // Fetch roles — SUPERUSER can filter by corporate; SUPERADMIN gets their own
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles-all', selectedCorp],
    queryFn: () => roleService.listAllRoles(selectedCorp || undefined).then(r => r.data),
  });

  const { data: permsData } = useQuery({
    queryKey: ['permissions-all'],
    queryFn: () => roleService.listAllPermissions().then(r => r.data),
  });

  const roles: RoleRow[] = (rolesData?.roles ?? []).map((r: RoleWithPermissions) => ({ ...r, id: String(r.id) }));
  const permissions = permsData?.permissions ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ['roles-all'] });

  const createMutation = useMutation({
    mutationFn: (d: { name: string; description: string; permission_ids: number[]; corporate_id?: string }) =>
      roleService.createRole(d),
    onSuccess: () => { invalidate(); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.error ?? 'Failed to create role'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: { role_id: number; name?: string; description?: string; permission_ids?: number[] }) =>
      roleService.updateRole(d),
    onSuccess: () => { invalidate(); setOpen(false); },
    onError: (e: any) => setErr(e?.response?.data?.error ?? 'Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId: number) => roleService.deleteRole(roleId),
    onSuccess: invalidate,
    onError: (e: any) => alert(e?.response?.data?.error ?? 'Failed to delete role'),
  });

  const addPermMutation = useMutation({
    mutationFn: ({ roleId, permId }: { roleId: number; permId: number }) =>
      roleService.addPermission(roleId, permId),
    onSuccess: invalidate,
  });

  const removePermMutation = useMutation({
    mutationFn: ({ roleId, permId }: { roleId: number; permId: number }) =>
      roleService.removePermission(roleId, permId),
    onSuccess: invalidate,
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', permission_ids: [] });
    setErr('');
    setOpen(true);
  };

  const openEdit = (role: RoleRow) => {
    setEditing(role);
    setForm({
      name: role.name,
      description: role.description ?? '',
      permission_ids: role.permissions.map((p: Permission) => p.id),
    });
    setErr('');
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setErr('Role name is required'); return; }
    if (editing) {
      updateMutation.mutate({ role_id: Number(editing.id), ...form });
    } else {
      const payload: any = { ...form };
      if (isSuperuser && selectedCorp) payload.corporate_id = selectedCorp;
      createMutation.mutate(payload);
    }
  };

  const openPermDialog = (role: RoleRow) => {
    setSelectedRole(roles.find(r => r.id === role.id) ?? role);
    setPermDialogOpen(true);
  };

  const togglePermission = (permId: number) => {
    if (!selectedRole) return;
    const hasIt = selectedRole.permissions.some((p: Permission) => p.id === permId);
    const roleId = Number(selectedRole.id);
    if (hasIt) {
      removePermMutation.mutate({ roleId, permId });
      setSelectedRole(prev => prev ? { ...prev, permissions: prev.permissions.filter(p => p.id !== permId) } : null);
    } else {
      addPermMutation.mutate({ roleId, permId });
      const perm = permissions.find(p => p.id === permId);
      if (perm) setSelectedRole(prev => prev ? { ...prev, permissions: [...prev.permissions, perm] } : null);
    }
  };

  const permsByModule: Record<string, Permission[]> = {};
  permissions.forEach((p: Permission) => {
    if (!permsByModule[p.module_slug]) permsByModule[p.module_slug] = [];
    permsByModule[p.module_slug].push(p);
  });

  const isSystemRole = (name: string) => ['SUPERADMIN', 'SUPERUSER'].includes(name.toUpperCase());

  return (
    <>
      {isSuperuser && (
        <Box sx={{ mb: 2.5 }}>
          <Alert severity="info" sx={{ mb: 1.5 }}>
            As a system superuser you can view and manage roles for any organisation.
          </Alert>
          <TextField
            select size="small" label="Filter by Organisation"
            value={selectedCorp} onChange={e => setSelectedCorp(e.target.value)}
            sx={{ minWidth: 280 }}
          >
            <MenuItem value="">All organisations</MenuItem>
            {corporates.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {!isSuperuser && isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can create and manage roles for your organisation. System roles cannot be modified.
        </Alert>
      )}

      <CrudTable
        title="Roles & Permissions"
        subtitle={isSuperuser ? 'All organisation roles — select an organisation above to filter' : 'Roles for your organisation'}
        columns={[
          { key: 'name', label: 'Role Name' },
          { key: 'corporate_name', label: 'Organisation' },
          { key: 'description', label: 'Description' },
          {
            key: 'permissions',
            label: 'Permissions',
            render: (r: RoleRow) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {r.permissions.slice(0, 3).map((p: Permission) => (
                  <Chip key={p.id} label={p.name} size="small" variant="outlined" />
                ))}
                {r.permissions.length > 3 && (
                  <Chip label={\`+\${r.permissions.length - 3} more\`} size="small" color="primary" />
                )}
                {!isSystemRole(r.name) && (
                  <Chip label="Manage" size="small" color="secondary"
                    onClick={() => openPermDialog(r)} sx={{ cursor: 'pointer' }} />
                )}
              </Box>
            ),
          },
        ]}
        rows={roles}
        loading={rolesLoading}
        canAdd={isSuperAdmin && !isSuperuser ? true : (isSuperuser && !!selectedCorp)}
        canEdit
        canDelete
        onAdd={openAdd}
        onEdit={(r: RoleRow) => { if (!isSystemRole(r.name)) openEdit(r); }}
        onDelete={(r: RoleRow) => {
          if (isSystemRole(r.name)) { alert('Cannot delete system roles'); return; }
          if (confirm(\`Delete role "\${r.name}"? This cannot be undone.\`)) {
            deleteMutation.mutate(Number(r.id));
          }
        }}
        emptyMessage={isSuperuser && !selectedCorp ? 'Select an organisation to view its roles' : 'No roles yet'}
      />

      <FormModal
        open={open} onClose={() => setOpen(false)}
        title={editing ? \`Edit Role: \${editing.name}\` : 'Create Role'}
        onSubmit={handleSave}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <Err msg={err} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Role Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required fullWidth helperText="Cannot use SUPERADMIN or SUPERUSER" />
          <TextField label="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            fullWidth multiline rows={2} />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Permissions ({form.permission_ids.length} selected)
            </Typography>
            <Box sx={{ maxHeight: 280, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              {Object.entries(permsByModule).map(([module, perms]) => (
                <Box key={module} sx={{ mb: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="primary" sx={{ textTransform: 'uppercase' }}>
                    {module}
                  </Typography>
                  {perms.map((p: Permission) => (
                    <FormControlLabel key={p.id}
                      control={
                        <Checkbox size="small"
                          checked={form.permission_ids.includes(p.id)}
                          onChange={e => setForm({
                            ...form,
                            permission_ids: e.target.checked
                              ? [...form.permission_ids, p.id]
                              : form.permission_ids.filter(id => id !== p.id),
                          })}
                        />
                      }
                      label={<Typography variant="body2">{p.name}</Typography>}
                      sx={{ display: 'block', ml: 1 }}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </FormModal>

      <Dialog open={permDialogOpen} onClose={() => setPermDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Permissions — {selectedRole?.name}</DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {Object.entries(permsByModule).map(([module, perms]) => (
                <Box key={module}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary"
                    sx={{ mb: 1, textTransform: 'uppercase' }}>{module}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {perms.map((p: Permission) => {
                      const hasIt = selectedRole.permissions.some((rp: Permission) => rp.id === p.id);
                      return (
                        <Chip key={p.id} label={p.name}
                          color={hasIt ? 'success' : 'default'}
                          variant={hasIt ? 'filled' : 'outlined'}
                          onClick={() => togglePermission(p.id)}
                          sx={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

`;

content = content.slice(0, startIdx) + newPanel + content.slice(endIdx);
fs.writeFileSync(filePath, content, 'utf8');
console.log('RolesPanel replaced successfully. File length:', content.length);

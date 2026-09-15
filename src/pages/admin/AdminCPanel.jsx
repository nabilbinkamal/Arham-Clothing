import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import { fetchWithAuth } from '../../utils/api';
import { Folder, File, Code, Database, Save, Play, ChevronLeft, Table2, LayoutList, List, Key, Type, DatabaseZap, Search } from 'lucide-react';

const AdminCPanel = ({ setAdminAuth }) => {
  const [activeMainTab, setActiveMainTab] = useState('files');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ----------------------------------------------------
  // File Manager State
  // ----------------------------------------------------
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [savingFile, setSavingFile] = useState(false);

  // ----------------------------------------------------
  // Database Manager State
  // ----------------------------------------------------
  const [dbTab, setDbTab] = useState('sql'); // sql, structure, browse
  const [dbTables, setDbTables] = useState([]);
  const [activeTable, setActiveTable] = useState(null);
  
  // SQL Editor State
  const [query, setQuery] = useState('SELECT * FROM settings LIMIT 10;');
  const [dbResult, setDbResult] = useState(null); 
  
  // Table View State
  const [tableSchema, setTableSchema] = useState(null);
  const [tableData, setTableData] = useState(null); // { rows: [], total: 0 }
  const [page, setPage] = useState(0);
  const LIMIT = 50;

  useEffect(() => {
    if (activeMainTab === 'files' && files.length === 0) {
      loadDirectory('');
    } else if (activeMainTab === 'db' && dbTables.length === 0) {
      loadDbTables();
    }
  }, [activeMainTab]);

  useEffect(() => {
    if (activeTable && activeMainTab === 'db') {
      if (dbTab === 'structure') loadTableSchema(activeTable);
      if (dbTab === 'browse') loadTableData(activeTable, 0);
    }
  }, [activeTable, dbTab]);

  // ====================================================
  // File Manager Functions
  // ====================================================
  const loadDirectory = async (pathStr) => {
    setLoading(true); setError('');
    try {
      const res = await fetchWithAuth(`/api/admin/cpanel/files?path=${encodeURIComponent(pathStr)}`);
      const data = await res.json();
      if (res.ok) {
        setCurrentPath(data.currentPath);
        setParentPath(data.parentPath);
        setFiles(data.files);
        setActiveFile(null);
      } else { setError(data.error || 'Failed to load directory.'); }
    } catch (err) { setError('Network error loading directory.'); }
    setLoading(false);
  };

  const loadFile = async (filePath) => {
    setLoading(true); setError('');
    try {
      const res = await fetchWithAuth(`/api/admin/cpanel/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (res.ok) { setActiveFile({ path: filePath, content: data.content }); } 
      else { setError(data.error || 'Failed to open file.'); }
    } catch (err) { setError('Network error opening file.'); }
    setLoading(false);
  };

  const saveFile = async () => {
    if (!activeFile) return;
    setSavingFile(true); setError('');
    try {
      const res = await fetchWithAuth(`/api/admin/cpanel/file`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeFile.path, content: activeFile.content })
      });
      const data = await res.json();
      if (res.ok) { alert('File saved successfully!'); } 
      else { setError(data.error || 'Failed to save file.'); }
    } catch (err) { setError('Network error saving file.'); }
    setSavingFile(false);
  };

  // ====================================================
  // Database Manager Functions
  // ====================================================
  const loadDbTables = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetchWithAuth('/api/admin/cpanel/db/tables');
      const data = await res.json();
      if (res.ok) { setDbTables(data.tables); } 
      else { setError(data.error || 'Failed to load tables.'); }
    } catch (err) { setError('Network error loading tables.'); }
    setLoading(false);
  };

  const loadTableSchema = async (tableName) => {
    setLoading(true); setError(''); setTableSchema(null);
    try {
      const res = await fetchWithAuth(`/api/admin/cpanel/db/tables/${tableName}/schema`);
      const data = await res.json();
      if (res.ok) { setTableSchema(data.schema); } 
      else { setError(data.error || 'Failed to load schema.'); }
    } catch (err) { setError('Network error loading schema.'); }
    setLoading(false);
  };

  const loadTableData = async (tableName, pageNum) => {
    setLoading(true); setError(''); setTableData(null); setPage(pageNum);
    try {
      const offset = pageNum * LIMIT;
      const res = await fetchWithAuth(`/api/admin/cpanel/db/tables/${tableName}/data?limit=${LIMIT}&offset=${offset}`);
      const data = await res.json();
      if (res.ok) { setTableData({ rows: data.rows, total: data.total }); } 
      else { setError(data.error || 'Failed to load table data.'); }
    } catch (err) { setError('Network error loading data.'); }
    setLoading(false);
  };

  const executeQuery = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setDbResult(null);
    try {
      const res = await fetchWithAuth(`/api/admin/cpanel/db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.rows) && data.rows.length > 0) {
          setDbResult({ columns: Object.keys(data.rows[0]), rows: data.rows });
        } else if (Array.isArray(data.rows)) {
           setDbResult({ columns: [], rows: [], message: '0 rows returned' });
        } else {
          setDbResult({ columns: [], rows: [], message: JSON.stringify(data.rows) });
        }
      } else { setError(data.error || 'Query execution failed.'); }
    } catch (err) { setError('Network error executing query.'); }
    setLoading(false);
  };

  // ====================================================
  // Render Helpers
  // ====================================================
  const renderDataGrid = (columns, rows) => (
    <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#111', color: 'white', zIndex: 1 }}>
          <tr>
            {columns.map(col => (
              <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fcfcfc' }}>
              {columns.map(col => {
                let val = row[col];
                if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                return (
                  <td key={col} style={{ padding: '12px 16px', fontSize: '13px', color: '#333', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(val)}>
                    {String(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout setAdminAuth={setAdminAuth}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>Developer Tools</h2>
          <p style={{ color: '#d32f2f', marginTop: '4px', fontWeight: 'bold', fontSize: '13px' }}>
            CAUTION: Direct file & database access. Improper use can break the system.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #ddd', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveMainTab('files')}
          style={{ background: activeMainTab === 'files' ? '#111' : '#eee', color: activeMainTab === 'files' ? 'white' : '#111', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Code size={18} /> File Manager
        </button>
        <button 
          onClick={() => setActiveMainTab('db')}
          style={{ background: activeMainTab === 'db' ? '#111' : '#eee', color: activeMainTab === 'db' ? 'white' : '#111', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Database size={18} /> Database Manager
        </button>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', fontWeight: '500', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ==============================================
          FILE MANAGER
      ============================================== */}
      {activeMainTab === 'files' && (
        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', border: '1px solid #ddd', height: '650px', overflow: 'hidden' }}>
          <div style={{ width: '300px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #ddd', background: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => loadDirectory(parentPath)} 
                disabled={loading}
                style={{ background: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              <div style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, direction: 'rtl', textAlign: 'left' }}>
                &lrm;{currentPath}&lrm;
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading && !activeFile ? <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading...</div> : null}
              <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                {files.map((file, idx) => (
                  <li key={idx} style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'background 0.2s', background: activeFile?.path === file.path ? '#e3f2fd' : 'transparent' }} 
                      onClick={() => file.isDirectory ? loadDirectory(file.path) : loadFile(file.path)}
                      onMouseOver={e => e.currentTarget.style.background = activeFile?.path === file.path ? '#e3f2fd' : '#f0f0f0'}
                      onMouseOut={e => e.currentTarget.style.background = activeFile?.path === file.path ? '#e3f2fd' : 'transparent'}
                  >
                    {file.isDirectory ? <Folder size={16} color="#ffa000" /> : <File size={16} color="#555" />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {activeFile ? (
              <>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #ddd', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Editing: {activeFile.path.split(/[\/\\]/).pop()}</div>
                  <button onClick={saveFile} disabled={savingFile} style={{ background: '#111', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                    <Save size={14} /> {savingFile ? 'Saving...' : 'Save File'}
                  </button>
                </div>
                <textarea 
                  value={activeFile.content}
                  onChange={(e) => setActiveFile({...activeFile, content: e.target.value})}
                  spellCheck="false"
                  style={{ flex: 1, padding: '20px', border: 'none', resize: 'none', outline: 'none', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5', background: '#282c34', color: '#abb2bf', whiteSpace: 'pre' }}
                />
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Select a file from the sidebar to edit
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==============================================
          DATABASE MANAGER
      ============================================== */}
      {activeMainTab === 'db' && (
        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', border: '1px solid #ddd', height: '650px', overflow: 'hidden' }}>
          
          {/* Tables Sidebar */}
          <div style={{ width: '250px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #ddd', background: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DatabaseZap size={16} color="#333" />
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Tables</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                <li style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', borderBottom: '1px solid #eee', background: !activeTable ? '#e3f2fd' : 'transparent' }} 
                    onClick={() => { setActiveTable(null); setDbTab('sql'); }}>
                  <Code size={16} color="#2196f3" />
                  <span style={{ fontWeight: '600' }}>SQL Editor</span>
                </li>
                {dbTables.map(table => (
                  <li key={table} style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', transition: 'background 0.2s', background: activeTable === table ? '#e3f2fd' : 'transparent' }} 
                      onClick={() => { setActiveTable(table); if(dbTab === 'sql') setDbTab('browse'); }}
                      onMouseOver={e => e.currentTarget.style.background = activeTable === table ? '#e3f2fd' : '#f0f0f0'}
                      onMouseOut={e => e.currentTarget.style.background = activeTable === table ? '#e3f2fd' : 'transparent'}
                  >
                    <Table2 size={14} color="#555" />
                    <span>{table}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
            
            {/* Header Tabs */}
            {activeTable && (
              <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid #ddd', background: '#fafafa' }}>
                <div style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold', color: '#333', borderRight: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table2 size={16} color="#111" /> {activeTable}
                </div>
                <button onClick={() => setDbTab('browse')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: dbTab === 'browse' ? '2px solid #111' : '2px solid transparent', color: dbTab === 'browse' ? '#111' : '#666', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <List size={16} /> Browse Data
                </button>
                <button onClick={() => setDbTab('structure')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: dbTab === 'structure' ? '2px solid #111' : '2px solid transparent', color: dbTab === 'structure' ? '#111' : '#666', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LayoutList size={16} /> Structure
                </button>
                <button onClick={() => setDbTab('sql')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: dbTab === 'sql' ? '2px solid #111' : '2px solid transparent', color: dbTab === 'sql' ? '#111' : '#666', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={16} /> Query
                </button>
              </div>
            )}

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* SQL TAB */}
              {dbTab === 'sql' && (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                      Execute Raw SQL {activeTable && `on \`${activeTable}\``}
                    </div>
                    <button onClick={executeQuery} disabled={loading} style={{ background: '#111', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                      <Play size={14} /> {loading ? 'Running...' : 'Run Query'}
                    </button>
                  </div>
                  <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    spellCheck="false"
                    style={{ width: '100%', height: '120px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', outline: 'none', background: '#f8f9fa', marginBottom: '20px', flexShrink: 0 }}
                  />
                  
                  {/* Results for Raw SQL */}
                  {dbResult && (
                    <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #ddd', background: '#f5f5f5', fontSize: '13px', fontWeight: 'bold' }}>Query Results</div>
                      <div style={{ flex: 1, overflow: 'auto' }}>
                        {dbResult.message ? (
                          <div style={{ padding: '20px', color: '#555' }}>{dbResult.message}</div>
                        ) : (
                          renderDataGrid(dbResult.columns, dbResult.rows)
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STRUCTURE TAB */}
              {dbTab === 'structure' && activeTable && (
                <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
                  {loading && !tableSchema ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading schema...</div>
                  ) : tableSchema ? (
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f5f5f5', color: '#333' }}>
                          <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #ddd' }}>Field</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #ddd' }}>Type</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #ddd' }}>Null</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #ddd' }}>Key</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #ddd' }}>Default</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', borderBottom: '1px solid #ddd' }}>Extra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableSchema.map((col, i) => (
                            <tr key={col.Field} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? 'white' : '#fcfcfc' }}>
                              <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {col.Key === 'PRI' ? <Key size={14} color="#f5b041" /> : <Type size={14} color="#888" />}
                                {col.Field}
                              </td>
                              <td style={{ padding: '10px 16px', fontSize: '13px', color: '#0277bd', fontFamily: 'monospace' }}>{col.Type}</td>
                              <td style={{ padding: '10px 16px', fontSize: '13px', color: '#555' }}>{col.Null}</td>
                              <td style={{ padding: '10px 16px', fontSize: '13px', color: '#555' }}>{col.Key}</td>
                              <td style={{ padding: '10px 16px', fontSize: '13px', color: '#888' }}>{col.Default === null ? 'NULL' : col.Default}</td>
                              <td style={{ padding: '10px 16px', fontSize: '13px', color: '#888' }}>{col.Extra}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              )}

              {/* BROWSE TAB */}
              {dbTab === 'browse' && activeTable && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {loading && !tableData ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading data...</div>
                  ) : tableData ? (
                    <>
                      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', background: '#fafafa' }}>
                        <div style={{ fontSize: '13px', color: '#555' }}>
                          Showing <b>{page * LIMIT + 1}</b> to <b>{Math.min((page + 1) * LIMIT, tableData.total)}</b> of <b>{tableData.total}</b> rows
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            disabled={page === 0 || loading} 
                            onClick={() => loadTableData(activeTable, page - 1)}
                            style={{ padding: '6px 12px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                          >
                            Prev
                          </button>
                          <button 
                            disabled={(page + 1) * LIMIT >= tableData.total || loading} 
                            onClick={() => loadTableData(activeTable, page + 1)}
                            style={{ padding: '6px 12px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: (page + 1) * LIMIT >= tableData.total ? 'not-allowed' : 'pointer' }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        {tableData.rows.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Table is empty.</div>
                        ) : (
                          renderDataGrid(Object.keys(tableData.rows[0] || {}), tableData.rows)
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCPanel;

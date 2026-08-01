import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Button, Input, Label, Card, CardContent } from '../components/ui';
import { Copy, ExternalLink, Trash2, Edit2, Check, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');

  const fetchUrls = async () => {
    try {
      setIsFetching(true);
      const data = await api.getUrls();
      setUrls(data);
    } catch (err) {
      setError('Failed to fetch URLs');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    setIsLoading(true);
    setError('');
    try {
      await api.createUrl(newUrl);
      setNewUrl('');
      fetchUrls();
    } catch (err) {
      setError(err.message || 'Failed to create short URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (shortUrl) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;
    try {
      await api.deleteUrl(shortUrl);
      fetchUrls();
    } catch (err) {
      setError(err.message || 'Failed to delete URL');
    }
  };

  const handleUpdate = async (shortUrl) => {
    if (!editUrl) return;
    try {
      await api.updateUrl(shortUrl, editUrl);
      setEditingId(null);
      fetchUrls();
    } catch (err) {
      setError(err.message || 'Failed to update URL');
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFullShortUrl = (shortUrl) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/${shortUrl}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Manage your shortened URLs</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="url">Shorten a long URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very-long-url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Shortening...' : 'Shorten'}
            </Button>
          </form>
          {error && <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Your URLs</h2>
        {isFetching ? (
          <div className="text-center py-8 text-slate-500">Loading URLs...</div>
        ) : urls.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">You haven't shortened any URLs yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {urls.map((url) => (
              <Card key={url.id} className="overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    {editingId === url.id ? (
                      <div className="flex gap-2 w-full max-w-xl">
                        <Input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="h-8"
                        />
                        <Button size="sm" onClick={() => handleUpdate(url.shortUrl)} className="h-8">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-slate-900 truncate flex-1 font-medium text-sm"
                          title={url.originalUrl}
                        >
                          {url.originalUrl}
                        </a>
                        <button
                          onClick={() => {
                            setEditingId(url.id);
                            setEditUrl(url.originalUrl || '');
                          }}
                          className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <a
                        href={getFullShortUrl(url.shortUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        {getFullShortUrl(url.shortUrl)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(url.id, getFullShortUrl(url.shortUrl))}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === url.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-500 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Clicks</span>
                      <div className="flex items-center gap-1.5 mt-1 font-medium text-slate-900">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        {url.clickCount || 0}
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Created</span>
                      <span className="mt-1 font-medium text-slate-900">
                        {url.createdDate ? new Date(url.createdDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="ml-auto md:ml-2">
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                        onClick={() => handleDelete(url.shortUrl)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

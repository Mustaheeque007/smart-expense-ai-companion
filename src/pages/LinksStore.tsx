
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useStoredLinks } from '@/hooks/useStoredLinks';
import { useNavigate } from 'react-router-dom';
import { Link, ExternalLink, Trash, ArrowLeft, Plus } from 'lucide-react';

const LinksStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { links, fetchLinks, addLink, deleteLink } = useStoredLinks();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchLinks();
  }, [user, navigate, fetchLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    setLoading(true);
    try {
      await addLink({
        title,
        url,
        description,
        category,
      });

      // Reset form
      setTitle('');
      setUrl('');
      setDescription('');
      setCategory('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding link:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Link className="h-6 w-6" />
                Stored Links
              </CardTitle>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
            <p className="text-gray-600">Save and organize your important website links</p>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Link title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category (optional)</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Work, Personal, Shopping"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the link"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Link'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {links.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Link className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No links stored yet</p>
                  <p className="text-sm">Add your first link to get started</p>
                </div>
              ) : (
                links.map((link) => (
                  <Card key={link.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 flex-1">{link.title}</h3>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLink(link.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {link.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded mb-2">
                          {link.category}
                        </span>
                      )}
                      <p className="text-sm text-gray-600 mb-2">{link.url}</p>
                      {link.description && (
                        <p className="text-sm text-gray-500">{link.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Added {new Date(link.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinksStore;

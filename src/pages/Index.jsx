import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const { toast } = useToast();

  const { data: audioUrl, isLoading, isError, refetch } = useQuery({
    queryKey: ['extractAudio', youtubeUrl],
    queryFn: async () => {
      if (!youtubeUrl) return null;
      // This is a mock API call. In a real application, you'd call your backend service here.
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      return 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/11/file_example_MP3_700KB.mp3'; // Real audio URL for testing
    },
    enabled: false, // Don't run the query automatically
  });

  const handleDownload = async () => {
    if (!audioUrl) {
      toast({
        title: "Error",
        description: "No audio URL available",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'youtube_audio.mp3';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Audio downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download the audio",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!youtubeUrl) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">YouTube Audio Extractor</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Extracting...' : 'Extract Audio'}
          </Button>
        </div>
      </form>
      {isError && (
        <p className="text-red-500 mb-4">An error occurred while extracting the audio.</p>
      )}
      {audioUrl && (
        <div className="text-center">
          <p className="mb-4">Audio extracted successfully!</p>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Audio
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;

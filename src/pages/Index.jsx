import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause } from "lucide-react";

const Index = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handlePlayPause = () => {
    const audioElement = document.getElementById('audioPlayer');
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
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
          <audio id="audioPlayer" src={audioUrl} className="w-full mb-4" controls />
          <Button onClick={handlePlayPause}>
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';

const Index = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const { toast } = useToast();

  const { data: scrapedData, isLoading, isError, refetch } = useQuery({
    queryKey: ['scrapeWebsite', websiteUrl],
    queryFn: async () => {
      if (!websiteUrl) return null;
      const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(websiteUrl)}`);
      const html = response.data.contents;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const extractText = (element) => {
        return Array.from(element.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0);
      };

      const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        type: h.tagName.toLowerCase(),
        text: h.textContent.trim()
      }));

      const paragraphs = Array.from(doc.querySelectorAll('p')).flatMap(extractText);

      const listItems = Array.from(doc.querySelectorAll('li')).flatMap(extractText);

      return { headings, paragraphs, listItems };
    },
    enabled: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!websiteUrl) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Website Content Scraper</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Scraping...' : 'Scrape Content'}
          </Button>
        </div>
      </form>
      {isError && (
        <p className="text-red-500 mb-4">An error occurred while scraping the website.</p>
      )}
      {scrapedData && (
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Headings</h2>
            {scrapedData.headings.map((heading, index) => (
              <div key={index} className={`mb-2 ${heading.type === 'h1' ? 'text-xl font-bold' : 'text-lg font-semibold'}`}>
                {heading.text}
              </div>
            ))}
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Paragraphs</h2>
            {scrapedData.paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-2">{paragraph}</p>
            ))}
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">List Items</h2>
            <ul className="list-disc list-inside">
              {scrapedData.listItems.map((item, index) => (
                <li key={index} className="mb-1">{item}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default Index;

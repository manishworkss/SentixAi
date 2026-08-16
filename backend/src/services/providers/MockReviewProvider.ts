import { ReviewProvider, NormalizedReview } from './ReviewProvider';

export class MockReviewProvider implements ReviewProvider {
  async fetchReviews(imdbId: string): Promise<NormalizedReview[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let mockData: any[] = [];
    
    const duneReviews = [
      { title: "A visual masterpiece", text: "The cinematography is absolutely breathtaking. Villeneuve has outdone himself in creating a world that feels incredibly real.", rating: 10, date: "1 March 2024", author: "johndoe" },
      { title: "Pacing issues but great acting", text: "While the cast delivered stellar performances, the second act dragged a bit too long for my liking.", rating: 6, date: "5 March 2024", author: "moviecritic89" },
      { title: "Incredible sound design", text: "Hans Zimmer's score and the sound design make this a must-watch in IMAX.", rating: 9, date: "10 March 2024", author: "imaxfan" },
      { title: "Too slow", text: "I found myself checking my watch multiple times. It looks pretty but nothing happens for hours.", rating: 3, date: "12 March 2024", author: "boredviewer" },
      { title: "Best sci-fi of the decade", text: "This is what epic sci-fi is all about. The scale, the acting, the story—everything clicks.", rating: 10, date: "15 March 2024", author: "scifinerd" },
      { title: "Confusing storyline", text: "If you haven't read the books, good luck understanding who is who and why they are doing what they are doing.", rating: 4, date: "18 March 2024", author: "confused123" },
      { title: "Timothee is phenomenal", text: "Chalamet truly anchors the film. His transformation throughout the movie is terrifying and brilliant.", rating: 9, date: "20 March 2024", author: "timmyfan" }
    ];

    const oppyReviews = [
      { title: "Nolan's Magnum Opus", text: "A dense, complex, and brilliantly executed historical drama. Cillian Murphy is guaranteed an Oscar.", rating: 10, date: "21 July 2023", author: "filmlover" },
      { title: "Too much talking", text: "It's 3 hours of men talking in small rooms. The bomb sequence was cool but the rest was exhausting.", rating: 5, date: "25 July 2023", author: "actionfan" },
      { title: "Masterclass in editing", text: "The way the timelines weave together is pure genius. The tension is palpable even though we know history.", rating: 9, date: "1 August 2023", author: "editorpro" },
      { title: "Inaudible dialogue", text: "Once again, Nolan's sound mixing makes it impossible to hear what the actors are whispering over the blaring score.", rating: 4, date: "10 August 2023", author: "whatdidhesay" },
    ];

    if (imdbId === 'tt15239678') {
      mockData = duneReviews;
    } else if (imdbId === 'tt15398776') {
      mockData = oppyReviews;
    } else {
      mockData = duneReviews.slice(0, 3).concat(oppyReviews.slice(0, 2));
    }

    // Normalize the mock data
    return mockData.map((rev, index) => ({
      externalId: `${imdbId}_mock_rev_${index}`, // Unique mock external ID
      text: rev.text,
      rating: rev.rating,
      reviewDate: new Date(rev.date),
      source: 'MOCK_IMDB',
      author: rev.author,
      title: rev.title
    }));
  }
}

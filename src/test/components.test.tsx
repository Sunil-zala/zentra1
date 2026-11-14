import { render, screen, fireEvent } from "@testing-library/react";
import user from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import SongCard from "@/components/SongCard";
import PlaylistCard from "@/components/PlaylistCard";

// SongCard uses useIsMobile, which reads window.matchMedia — stub it for jsdom.
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));

const track = {
  id: "t-1",
  title: "Midnight Drive",
  artist: "Luna",
  album: "Neon Hours",
  duration: 213,
  image: "/a.jpg",
  imageBig: "/a-big.jpg",
  url: "https://example.com/t-1.mp3",
  hasLyrics: true,
};

const playlist = {
  id: "p-1",
  title: "Chill Vibes",
  image: "/p.jpg",
  songCount: 12,
  type: "user",
};

describe("cn", () => {
  it("joins truthy classes and drops falsy ones", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
    expect(cn()).toBe("");
  });
});

describe("Logo", () => {
  it("renders the full wordmark by default", () => {
    render(<Logo />);
    expect(screen.getByText("Zentra")).toBeInTheDocument();
  });

  it("renders mark-only when markOnly is set", () => {
    const { container } = render(<Logo markOnly />);
    expect(screen.queryByText("Zentra")).not.toBeInTheDocument();
    expect(container.querySelector("span")).toBeTruthy();
  });
});

describe("Button", () => {
  it("renders with default variant and forwards click handlers", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole("button", { name: "Click me" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled is set", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button", { name: "Disabled" });
    expect(btn).toBeDisabled();
  });
});

describe("SongCard", () => {
  const renderCard = (overrides = {}) =>
    render(
      <SongCard
        track={track}
        isPlaying={false}
        isCurrent={false}
        onPlay={vi.fn()}
        onAddToQueue={vi.fn()}
        onPlayNext={vi.fn()}
        index={0}
        {...overrides}
      />
    );

  it("shows title, artist and album art", () => {
    renderCard();
    expect(screen.getByText("Midnight Drive")).toBeInTheDocument();
    expect(screen.getByText("Luna")).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/a.jpg");
    expect(img).toHaveAttribute("alt", "Neon Hours");
  });

  it("calls onPlay with the track when the card is clicked", async () => {
    const onPlay = vi.fn();
    renderCard({ onPlay });
    const card = screen.getByText("Midnight Drive").closest("div") as HTMLElement;
    fireEvent.click(card);
    expect(onPlay).toHaveBeenCalledWith(track);
  });

  it("renders a favorite heart that toggles via onToggleFavorite", async () => {
    const onToggleFavorite = vi.fn();
    renderCard({ onToggleFavorite, isFavorite: false });
    // The heart is a bare lucide Heart SVG with no accessible name; select it
    // by role + the lucide-heart icon class instead.
    const heart = screen.getByRole("button").querySelector("svg.lucide-heart");
    expect(heart).not.toBeNull();
    await user.click(heart as HTMLElement);
    expect(onToggleFavorite).toHaveBeenCalledWith("t-1", track);
  });
});

describe("PlaylistCard", () => {
  it("renders title, song count and image", () => {
    render(<PlaylistCard playlist={playlist} onClick={vi.fn()} index={0} />);
    expect(screen.getByText("Chill Vibes")).toBeInTheDocument();
    expect(screen.getByText("12 songs")).toBeInTheDocument();
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/p.jpg");
    expect(img).toHaveAttribute("alt", "Chill Vibes");
  });

  it("invokes onClick with the playlist when clicked", async () => {
    const onClick = vi.fn();
    render(<PlaylistCard playlist={playlist} onClick={onClick} index={0} />);
    await user.click(screen.getByText("Chill Vibes").closest("div") as HTMLElement);
    expect(onClick).toHaveBeenCalledWith(playlist);
  });
});
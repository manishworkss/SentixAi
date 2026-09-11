import React from 'react';
import { MoviesExplorer } from '../components/MoviesExplorer';
import { useNavigate } from 'react-router-dom';

export function Films() {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <MoviesExplorer onSelectMovie={(id) => navigate(`/movie/${id}`)} />
    </div>
  );
}

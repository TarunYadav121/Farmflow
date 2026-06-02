import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          className="product-card__image"
        />
        <h3 className="product-card__name">{product.name}</h3>
      </Link>
      <p className="product-card__price">${product.price} / {product.unit}</p>
      <p className="product-card__seller">By {product.seller?.name}</p>
      <button
        className="product-card__btn"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

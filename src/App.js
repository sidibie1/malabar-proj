import "@/App.css";
import { ArrowUpRight, CheckCircle2, Clock3, Leaf, MapPin, Menu, MessageCircle, Phone, Smartphone, Star, Store, UtensilsCrossed, X } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const PAYMENTS_API = process.env.REACT_APP_PAYMENTS_API_URL || "";

const phone = "tel:+918291463189";
const whatsapp = "https://wa.me/918291463189";
const directions = "https://www.google.com/maps/search/?api=1&query=Malabar+Stores+Tilak+Nagar+Kurla+Mumbai";

const products = [
  { name: "Chakkavaraty", price: "₹130", note: "A beloved Kerala pantry favourite, ready for your next treat.", icon: "✣", tone: "saffron", image: "/images/chakkavaraty.png" },
  { name: "Payasam Mix", price: "Ask in-store", note: "Milma, Double Horse, Priya and Palada mixes.", icon: "◒", tone: "leaf", image: "/images/payasam-mix.png" },
  { name: "Fresh homemade Eladda & Ragi Ada", price: "₹50", note: "Soft, homemade snacks made with care.", icon: "⌁", tone: "coconut", image: "/images/eladda-ragi-ada.png" },
  { name: "Pickles", price: "Ask in-store", note: "Thankam, Narasus, Double Horse, Tholur and Ruchipriya.", icon: "◉", tone: "red", image: "/images/pickles.png" },
  { name: "Homemade Vatteppam", price: "₹70", note: "Available Sat & Sun, or made on order.", icon: "❋", tone: "cream", image: "/images/vatteppam.png" },
  { name: "Coconuts specially from Kerala", price: "₹45", note: "Fresh coconuts brought in specially from Kerala.", icon: "◌", tone: "leaf", image: "/images/coconut.png" },
  { name: "Homemade Achappam", price: "₹50", note: "Crisp, delicate and made the homestyle way.", icon: "✤", tone: "saffron", image: "/images/achappam.png" },
];

function ActionLinks({ compact = false, prefix = "hero" }) {
  return <div className={compact ? "action-links compact" : "action-links"}>
    <a data-testid={`${prefix}-call-now-button`} className="button button-primary" href={phone}><Phone size={17} /> Call Now</a>
    <a data-testid={`${prefix}-get-directions-button`} className="button button-outline" href={directions} target="_blank" rel="noreferrer"><MapPin size={17} /> Get Directions</a>
    <a data-testid={`${prefix}-whatsapp-button`} className="button button-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a>
  </div>;
}

const parsePrice = (priceStr) => {
  if (priceStr.toLowerCase().includes("ask")) return 0;
  const match = priceStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const UPI_APPS = [
  { name: "Google Pay", scheme: "gpay://upi/pay" },
  { name: "PhonePe", scheme: "phonepe://pay" }
];

const MERCHANT_VPA = "ssr1996@okicici";
const MERCHANT_NAME = "Malabar Stores";

function buildUpiUrl(scheme, amount) {
  const params = new URLSearchParams({
    pa: MERCHANT_VPA,
    pn: MERCHANT_NAME,
    am: Number(amount).toFixed(2),
    cu: "INR",
  });

  return `${scheme}?${params.toString()}`;
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function ProductCard({ product, index, cartItem, onAdd, onUpdateQty }) {
  const isAskInStore = product.price.toLowerCase().includes("ask");
  return <article data-testid={`product-card-${index + 1}`} className={`product-card product-${product.tone} flex flex-col justify-between`}>
    <div>
      <div className="product-art" aria-hidden="true">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <>
          <span>{product.icon}</span>
          <i />
          </>
        )}
      </div>
      <div className="product-copy">
        <div className="product-topline">
          <span className="eyebrow">Kerala pantry</span>
          <span data-testid={`product-price-${index + 1}`} className="price">
            {isAskInStore ? "₹0 (Ask in-store)" : product.price}
          </span>
        </div>
        <h3 data-testid={`product-name-${index + 1}`}>{product.name}</h3>
        <p data-testid={`product-description-${index + 1}`}>{product.note}</p>
      </div>
    </div>

    <div className="px-5 pb-5 pt-2">
      {cartItem ? (
        <div className="flex items-center justify-between bg-white border border-[#d8cdbc] rounded p-1.5 shadow-sm">
          <button
            data-testid={`decrease-qty-${index + 1}`}
            onClick={() => onUpdateQty(product.name, -1)}
            className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition"
          >
            -
          </button>
          <span data-testid={`cart-qty-${index + 1}`} className="font-semibold px-4 text-sm text-gray-800">{cartItem.quantity}</span>
          <button
            data-testid={`increase-qty-${index + 1}`}
            onClick={() => onUpdateQty(product.name, 1)}
            className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition"
          >
            +
          </button>
        </div>
      ) : (
        <button
          data-testid={`add-to-cart-${index + 1}`}
          onClick={() => onAdd(product)}
          className="w-full flex items-center justify-center gap-2 bg-leaf hover:bg-opacity-90 text-white font-medium py-2.5 px-4 rounded shadow-sm transition text-sm"
          style={{ backgroundColor: "var(--leaf)" }}
        >
          Add to Cart
        </button>
      )}
    </div>
  </article>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [receipt, setReceipt] = useState(null);

  const closeCart = () => {
    setIsCartOpen(false);
    setPaymentStatus("idle");
    setPaymentMessage("");
    setReceipt(null);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === product.name);
      if (existing) {
        return prev.map((item) =>
          item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productName) => {
    setCart((prev) => prev.filter((item) => item.name !== productName));
  };

  const updateQuantity = (productName, delta) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.name === productName) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = parsePrice(item.price);
    return sum + price * item.quantity;
  }, 0);

  const hasAskInStoreItems = cart.some((item) => item.price.toLowerCase().includes("ask"));

  const getWhatsAppOrderLink = () => {
    const itemLines = cart.map(item => {
      const isAsk = item.price.toLowerCase().includes("ask");
      const priceText = isAsk ? "₹0 (Ask in-store)" : item.price;
      return `- ${item.name} x${item.quantity} (${priceText})`;
    }).join("\n");

    const totalText = `₹${subtotal}${hasAskInStoreItems ? " (Ask in-store items are set to ₹0. Please confirm price on WhatsApp)" : ""}`;

    let message = `Hello Malabar Stores, I'd like to place an order:\n\n${itemLines}\n\n*Total:* ${totalText}`;

    if (customerName.trim() || addressLine1.trim() || addressLine2.trim()) {
      message += `\n\n*Delivery Details:*`;
      if (customerName.trim()) {
        message += `\n- Name: ${customerName.trim()}`;
      }
      if (addressLine1.trim() || addressLine2.trim()) {
        message += `\n- Address: ${[addressLine1.trim(), addressLine2.trim()].filter(Boolean).join(", ")}`;
      }
    }

    message += `\n\nI have completed the UPI payment. Sharing the screenshot of my payment below!`;
    return `https://wa.me/918291463189?text=${encodeURIComponent(message)}`;
  };

  const handleRazorpayPayment = async () => {
    if (subtotal <= 0) return;
    setPaymentStatus("processing");
    setPaymentMessage("");

    if (!PAYMENTS_API) {
      setPaymentStatus("error");
      setPaymentMessage("Online payments are not configured yet. Please add the payments API URL.");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaymentStatus("error");
      setPaymentMessage("Could not load the payment gateway. Please try again.");
      return;
    }

    try {
      const { data: order } = await axios.post(`${PAYMENTS_API}/.netlify/functions/create-order`, { amount: subtotal });

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Malabar Stores",
        description: "Order payment",
        prefill: customerName.trim() ? { name: customerName.trim() } : undefined,
        theme: { color: "#245b43" },
        modal: {
          ondismiss: () => setPaymentStatus("idle"),
        },
        handler: async (response) => {
          try {
            const { data: verification } = await axios.post(`${PAYMENTS_API}/.netlify/functions/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verification.verified) {
              setReceipt({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                timestamp: new Date().toLocaleString(),
                customerName: customerName.trim(),
                items: cart,
                subtotal,
              });
              setPaymentStatus("success");
              setPaymentMessage("");
              setCart([]);
            } else {
              setPaymentStatus("error");
              setPaymentMessage("Payment verification failed. Please contact us before retrying.");
            }
          } catch (e) {
            setPaymentStatus("error");
            setPaymentMessage("Payment verification failed. Please contact us before retrying.");
          }
        },
      };

      const razorpayCheckout = new window.Razorpay(options);
      razorpayCheckout.open();
    } catch (e) {
      setPaymentStatus("error");
      setPaymentMessage("Could not start payment. Please try again.");
    }
  };

  return <div className="site-shell">
    <header className="site-header"><div className="nav-wrap">
      <a data-testid="brand-link" className="brand" href="#top" onClick={closeMenu}><span className="brand-mark"><Leaf size={20} /></span><span>Malabar <b>Stores</b></span></a>
      <button data-testid="mobile-menu-button" className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      <nav data-testid="main-navigation" className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
        <a data-testid="nav-about-link" href="#about" onClick={closeMenu}>Our story</a><a data-testid="nav-products-link" href="#products" onClick={closeMenu}>Pantry picks</a><a data-testid="nav-reviews-link" href="#reviews" onClick={closeMenu}>Reviews</a><a data-testid="nav-visit-link" href="#visit" onClick={closeMenu}>Find us</a>
        <a data-testid="header-call-button" className="nav-call" href={phone}><Phone size={15} /> Call the shop</a>
      </nav>
    </div></header>

    <main id="top">
      <section className="hero section-pad"><div className="hero-grid inner-width">
        <div className="hero-copy"><p data-testid="hero-eyebrow" className="eyebrow hero-eyebrow"><span /> Kurla's Kerala pantry</p>
          <h1 data-testid="hero-title">A little taste of <em>home.</em></h1>
          <p data-testid="hero-tagline" className="hero-tagline">A place where you can find all the South Indian items that you need, especially Kerala items.</p>
          <div data-testid="hero-rating" className="rating-line"><span className="rating-stars">★★★★★</span><strong>5.0</strong><span>Google rating</span><i>•</i><span>5/5 on Facebook</span></div>
          <ActionLinks />
        </div>
        <div className="hero-visual" aria-label="A warm illustrated Kerala pantry scene"><div className="sun-stamp">EST.<br /><b>LOCAL</b></div><div className="leaf-shape leaf-one" /><div className="leaf-shape leaf-two" /><div className="coconut-doodle"><Leaf size={64} strokeWidth={1.1} /></div><div className="hero-label"><Store size={16} /><span>Family-run<br /><b>since day one</b></span></div><div className="hero-arc" /></div>
      </div><div className="hero-ticker"><div className="inner-width ticker-content"><span>Fresh from Kerala</span><span>•</span><span>Homemade favourites</span><span>•</span><span>Good food, good people</span></div></div></section>

      <section id="about" className="about section-pad"><div className="inner-width about-grid"><div><p className="eyebrow">01 / Our story</p><h2 data-testid="about-heading">The neighbourhood pantry with a <em>homemade heart.</em></h2><p data-testid="about-description" className="body-large">For everyday staples, nostalgic snacks and those hard-to-find Kerala favourites, Malabar Stores is a trusted local stop in Tilak Nagar. We keep the shelves stocked with authentic South Indian goodness—and treat every customer like a neighbour.</p><a data-testid="about-products-link" className="text-link" href="#products">See what's on the shelf <ArrowUpRight size={17} /></a></div><div className="trust-card"><div className="trust-icon"><UtensilsCrossed size={23} /></div><p className="eyebrow">Open every day</p><h3 data-testid="about-hours">10 AM–2 PM<br /><span>&</span> 4:30 PM–9 PM</h3><div className="rule" /><p data-testid="about-category">South Indian & Kerala<br />specialty groceries</p></div></div></section>

      <section id="products" className="products section-pad">
        <div className="inner-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / Pantry picks</p>
              <h2 data-testid="products-heading">Good things from <em>our shelves.</em></h2>
            </div>
              <p data-testid="products-intro">Homemade treats, Kerala staples and familiar brands—picked for the way you actually cook and eat.</p>
            </div>
            <div className="product-grid">
              {products.map((product, i) => {
                const cartItem = cart.find(item => item.name === product.name);
                return (
                  <ProductCard
                    key={product.name}
                    product={product}
                    index={i}
                    cartItem={cartItem}
                    onAdd={addToCart}
                    onUpdateQty={updateQuantity}
                  />
                );
              })}
            </div>
        </div>
      </section>

      <section id="reviews" className="reviews section-pad">
        <div className="inner-width review-grid">
          <div className="review-score">
            <p className="eyebrow">03 / Kind words</p>
            <div data-testid="review-rating-badge" className="rating-badge">
              <Star size={25} fill="currentColor" /><strong>5.0</strong><span>Google<br />rating</span>
            </div>
            <p className="review-note">Small shop, big trust.<br />Thank you for keeping us going.</p>
            </div>
            <div className="quotes">
              <blockquote data-testid="review-quote-1">
                <span>"</span>Owner & Staff are very cordial & courteous too<small>Google review</small>
              </blockquote>
              <blockquote data-testid="review-quote-2">
                <span>"</span>Good relationship with customers.<small>Google review</small>
              </blockquote>
            </div>
          </div>
        </section>

      <section id="visit" className="visit section-pad"><div className="inner-width visit-grid"><div className="map-frame"><iframe data-testid="location-map" title="Map showing Malabar Stores in Tilak Nagar, Kurla" loading="lazy" src="https://www.google.com/maps?q=Malabar+Stores+Tilak+Nagar+Kurla+Mumbai&output=embed" /></div><div className="visit-copy"><p className="eyebrow">04 / Come say hello</p><h2 data-testid="visit-heading">Find us in <em>Tilak Nagar.</em></h2><div className="contact-list"><div data-testid="location-address"><MapPin size={20} /><p><b>Address</b>Sainath Co-op Hsg. Society Ltd,<br />Bldg No. 24, Shop No.1, Shree,<br />Tilak Nagar, Kurla, Mumbai<br />Maharashtra 400089</p></div><div data-testid="location-hours"><Clock3 size={20} /><p><b>Hours</b>Open daily<br />10 AM–2 PM & 4:30 PM–9 PM</p></div><div data-testid="location-phone"><Phone size={20} /><p><b>Call us</b><a data-testid="location-phone-link" href={phone}>082914 63189</a></p></div></div><ActionLinks prefix="visit" compact /></div></div></section>
    </main>

    <footer className="site-footer">
      <div className="inner-width footer-grid">
        <div>
          <a data-testid="footer-brand-link" className="brand footer-brand" href="#top">
            <span className="brand-mark"><Leaf size={20} /></span>
            <span>Malabar <b>Stores</b></span>
          </a>
          <p data-testid="footer-note">A family-run Kerala grocery store serving Kurla with warmth, good food and familiar faces.</p>
        </div>
        <div className="footer-contact">
          <p className="eyebrow">Keep in touch</p>
          <a data-testid="footer-phone-link" href={phone}><Phone size={15} /> 082914 63189</a>
          <a data-testid="footer-whatsapp-link" href={whatsapp} target="_blank" rel="noreferrer">
            <MessageCircle size={15} /> WhatsApp us
          </a>
        </div>
        <div className="footer-address">
          <p className="eyebrow">Come by</p>
          <p data-testid="footer-address-text">Shop No. 1, Bldg 24<br />Tilak Nagar, Kurla<br />Mumbai 400089</p>
        </div>
      </div>
      <div className="footer-bottom inner-width">
        <span>© Malabar Stores</span>
        <span data-testid="footer-founding-note">Family-run since — year to be confirmed</span>
        <a data-testid="footer-directions-link" href={directions} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={14} /></a>
      </div>
    </footer>

    {/* Floating Cart Button */}
    {totalItems > 0 && (
      <button
        data-testid="floating-cart-button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 text-white font-bold py-3.5 px-6 rounded-full shadow-2xl transition duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "var(--leaf)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
        }}
      >
        <div className="relative">
          <Store size={22} />
          <span
            data-testid="cart-badge"
            className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-white"
          >
            {totalItems}
          </span>
        </div>
        <span className="text-sm font-semibold">View Cart (₹{subtotal})</span>
      </button>
    )}

    {/* Slide-over Cart Drawer */}
    {isCartOpen && (
      <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-black/60 transition-opacity backdrop-blur-sm"
          onClick={closeCart}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex">
          <div className="w-screen max-w-md bg-[#fff9ee] border-l border-[#d8cdbc] shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#d8cdbc] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                {receipt ? (
                  <>
                    <CheckCircle2 size={20} style={{ color: "var(--leaf)" }} />
                    <h2 className="text-xl font-bold font-serif text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Order Confirmed</h2>
                  </>
                ) : (
                  <>
                    <Store size={20} style={{ color: "var(--leaf)" }} />
                    <h2 className="text-xl font-bold font-serif text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your Cart</h2>
                    <span className="bg-[#dde7d5] text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full ml-1">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </span>
                  </>
                )}
              </div>
              <button
                data-testid="close-cart-button"
                onClick={closeCart}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid={receipt ? "order-receipt" : undefined}>
              {receipt ? (
                <>
                  <div className="flex flex-col items-center text-center gap-2 py-2">
                    <CheckCircle2 size={48} style={{ color: "var(--leaf)" }} />
                    <h3 className="text-lg font-bold text-gray-900">Thank you{receipt.customerName ? `, ${receipt.customerName}` : ""}!</h3>
                    <p className="text-sm text-gray-500">Your payment was successful and your order is confirmed.</p>
                  </div>
                  <div className="bg-[#fcf8f2] border border-[#d8cdbc] rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Order ID</span>
                      <span data-testid="receipt-order-id" className="font-mono text-gray-800 break-all text-right ml-3">{receipt.orderId}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Payment ID</span>
                      <span data-testid="receipt-payment-id" className="font-mono text-gray-800 break-all text-right ml-3">{receipt.paymentId}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Date</span>
                      <span className="text-gray-800">{receipt.timestamp}</span>
                    </div>
                    <div className="border-t border-[#d8cdbc] pt-3 space-y-2">
                      {receipt.items.map((item, i) => (
                        <div key={item.name} data-testid={`receipt-item-${i + 1}`} className="flex justify-between text-sm text-gray-700">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{item.price.toLowerCase().includes("ask") ? "₹0" : item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#d8cdbc] pt-3 flex justify-between font-bold text-gray-900">
                      <span>Total Paid</span>
                      <span data-testid="receipt-total" style={{ color: "var(--leaf)" }}>₹{receipt.subtotal}</span>
                    </div>
                  </div>
                </>
              ) : cart.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                  <Store size={48} className="text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-1 max-w-[220px]">Explore our kitchen classics and add some delicious treats!</p>
                  <button
                    onClick={closeCart}
                    className="mt-6 px-5 py-2 text-white text-sm font-semibold rounded transition"
                    style={{ backgroundColor: "var(--leaf)" }}
                  >
                    Browse pantry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => {
                    const isAsk = item.price.toLowerCase().includes("ask");
                    return (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-white border border-[#d8cdbc] rounded-lg shadow-sm gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#f6f0e5] rounded flex-shrink-0 overflow-hidden flex items-center justify-center text-lg">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{item.icon}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-gray-950">{item.name}</h4>
                            <p className="text-xs text-gray-500 font-medium">
                              {isAsk ? "₹0 (Ask in-store)" : item.price}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Qty Controls */}
                          <div className="flex items-center border border-gray-200 rounded p-1 bg-gray-50">
                            <button
                              onClick={() => updateQuantity(item.name, -1)}
                              className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600 transition"
                            >
                              -
                            </button>
                            <span className="font-semibold px-2 text-xs text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.name, 1)}
                              className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600 transition"
                            >
                              +
                            </button>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={() => removeFromCart(item.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition"
                            title="Remove product"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Receipt footer */}
            {receipt && (
              <div className="border-t border-[#d8cdbc] p-6 bg-white">
                <button
                  data-testid="continue-shopping-button"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded shadow transition duration-200 text-sm"
                  style={{ backgroundColor: "var(--leaf)" }}
                >
                  Continue Shopping
                </button>
              </div>
            )}

            {/* Footer with Subtotal, QR code & payment */}
            {!receipt && cart.length > 0 && (
              <div className="border-t border-[#d8cdbc] p-6 bg-white space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span className="text-base font-medium">Cart Total:</span>
                    <span data-testid="cart-total-price" className="text-xl font-bold" style={{ color: "var(--leaf)" }}>
                      ₹{subtotal}
                    </span>
                  </div>
                  {hasAskInStoreItems && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 leading-tight">
                      ℹ️ "Ask in-store" items are included in your cart as ₹0. Please confirm their final prices with us when placing the order.
                    </p>
                  )}
                </div>

                {/* Direct Pay via UPI App Section */}
                <div className="bg-[#fcf8f2] border border-[#d8cdbc] rounded-lg p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-gray-800 tracking-wide uppercase text-center">Pay via UPI App</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {UPI_APPS.map((app) => (
                      <a
                        key={app.name}
                        href={buildUpiUrl(app.scheme, subtotal)}
                        data-testid={`upi-app-${app.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-[#d8cdbc] rounded shadow-sm hover:bg-amber-50 text-xs font-semibold text-gray-800 transition"
                      >
                        <Smartphone size={14} className="text-emerald-600" />
                        <span>{app.name}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Razorpay Online Payment */}
                <div className="bg-[#fcf8f2] border border-[#d8cdbc] rounded-lg p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-gray-800 tracking-wide uppercase text-center">Pay Online</h3>
                  <button
                    data-testid="razorpay-pay-button"
                    onClick={handleRazorpayPayment}
                    disabled={subtotal <= 0 || paymentStatus === "processing"}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded shadow-sm text-sm font-semibold text-white transition disabled:opacity-50"
                    style={{ backgroundColor: "var(--leaf)" }}
                  >
                    {paymentStatus === "processing" ? "Processing..." : `Pay ₹${subtotal} Now`}
                  </button>
                  {paymentMessage && (
                    <p
                      data-testid="payment-status-message"
                      className={`text-[11px] text-center leading-tight ${paymentStatus === "success" ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {paymentMessage}
                    </p>
                  )}
                </div>

                {/* Delivery Address Section */}
                <div className="bg-[#fcf8f2] border border-[#d8cdbc] rounded-lg p-4 space-y-3">
                  <h3 className="text-xs font-bold text-gray-800 tracking-wide uppercase">Delivery Address</h3>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#d8cdbc] rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800"
                        data-testid="customer-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House/Flat/Bldg no., street"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#d8cdbc] rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800"
                        data-testid="address-line1-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Area, landmark, city"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#d8cdbc] rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800"
                        data-testid="address-line2-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <a
                    href={getWhatsAppOrderLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded shadow transition duration-200 text-sm"
                  >
                    <MessageCircle size={18} /> Confirm & Send Screenshot
                  </a>
                  <p className="text-[10px] text-gray-400 text-center leading-tight">
                    Please pay the total above, take a screenshot, and click the button to send your order and screenshot via WhatsApp!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>;
}

export default App;

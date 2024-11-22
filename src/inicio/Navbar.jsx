import { useNavigate } from "react-router-dom";
import { useState } from "react";
import './Navar.css';
import './Siber.css'
import logo from '../assets/logo.jpeg'
import Buscador from "./Buscador";
import { getCategories } from "../service/api";
import { getCountries } from "../service/api";
import { useUser } from "../contexts/userContext";
import Visualizar from './Visualizar';
import Editar from './Editar';
import Modal from './ModalPerfil';

const Navbar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const { user, setUser } = useUser();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openVisualizar = () => {
    setModalContent(
      <Visualizar onEdit={openEditar} />
    );
    setIsModalOpen(true);
  };
  const openEditar = () => {
    setModalContent(
      <Editar
        onCancel={openVisualizar}
      />);
  };
  const closeModalPerfil = () => {
    setIsModalOpen(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data); // Almacena las categorías en el estado
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const handleCategoryClick = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
    if (!categories.length) {
      fetchCategories();
    }
  };

  // Función para obtener los países
  const fetchCountries = async () => {
    try {
      const response = await getCountries();
      setCountries(response.data); // Almacena los países en el estado
    } catch (error) {
      console.error("Error al obtener los países:", error);
    }
  };

  // Abre el dropdown de países y carga los países si aún no están cargados
  const handleCountryClick = () => {
    setIsCountryDropdownOpen(!isCountryDropdownOpen);
    if (!countries.length) {
      fetchCountries();
    }
  };

  const handleLogout = () => {
    setUser(null); // Limpia el estado del usuario en el contexto
    navigate('/'); // Redirige al usuario a la página de inicio
  };

  return (
    <>
      <div className="Navbar" style={{ backgroundColor: '#001745' }}>
        <button className="btn-treslineas" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample">
          <i className="bi bi-list" id="treslinaes"></i>
        </button>
        <div className="logo-nombre">
          <button className="logo-button" onClick={() => navigate('/')}>
            <div className="logo">
              <img src={logo} className="img-logo" alt="portada" />
            </div>
          </button>
          <div className="nombre-app">
            <h3>HistoryHouse</h3>
          </div>
        </div>
        <div className="contenedor-buscador">
          <Buscador></Buscador>
        </div>
        <div className="contenedor-usuario">
          <div className="dropdownUser">
            <button
              className="btn dropdown-usuario dropdown-user"
              type="button"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="bi bi-person"></i>
              {user ? user.nombreUsuario : "Usuario"}
            </button>
            <ul className="dropdown-menu" role="menu">
              {user ? (
                <li role="menuitem">
                  <button className="dropdown-item" onClick={openVisualizar}>
                    Visualizar perfil
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </li>
              ) : (
                <li role="menuitem">
                  <button className="dropdown-item" onClick={() => navigate('/Login')}>
                    Iniciar sesión
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
      <div
        className="offcanvas offcanvas-start sidebar-custom"
        tabIndex="-1"
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Filtros</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        {/* --------------------------------------------------------------------------------------------------------------------------------------------------*/}
        <div className="accordion" id="accordionExample">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
                onClick={handleCategoryClick}
              >
                Categoría
              </button>
            </h2>
            <div
              id="collapseOne"
              className="accordion-collapse collapse show"
              aria-labelledby="headingOne"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                <ul className="list-group">
                  {categories.length > 0 ? (
                    categories
                      .sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map((category) => (
                        <li key={category.id} className="list-group-item">
                          <button
                            className={`btn btn-link ${selectedCategory === category.id ? "active" : ""
                              }`}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              navigate(`/Libros/pais/${category.id}`);

                            }}
                            data-bs-dismiss="offcanvas"
                            aria-label="Close"
                          >
                            <h6>{category.nombre}</h6>
                          </button>
                        </li>
                      ))
                  ) : (
                    <li className="list-group-item">Cargando categorías...</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                onClick={handleCountryClick}
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                País
              </button>
            </h2>
            <div
              id="collapseTwo"
              className="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                <ul
                  className="list-group"
                  style={{
                    maxHeight: countries.length > 5 ? "300px" : "auto",
                    overflowY: countries.length > 5 ? "scroll" : "visible",
                  }}
                >
                  {countries.length > 0 ? (
                    countries
                      .sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map((country) => (
                        <li key={country.id} className="list-group-item">
                          <button
                            className={`btn btn-link ${selectedCountry === country.id ? "active" : ""
                              }`}
                            onClick={() => {
                              setSelectedCountry(country.id);
                              navigate(`/Libros/pais/${country.id}`);

                            }}
                            data-bs-dismiss="offcanvas"
                            aria-label="Close"
                          >
                            <h6>{country.nombre}</h6>
                          </button>
                        </li>
                      ))
                  ) : (
                    <li className="list-group-item">Cargando países...</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} userId={user}
          onClose={closeModalPerfil}>
          {modalContent}
        </Modal>)}
    </>
  );
};

export default Navbar;
import { gql } from "@apollo/client"

// Unified Search Query
export const SEARCH_ALL = gql`
  query SearchAll($textSearch: String!, $citextSearch: citext!, $textSearchStart: String!, $citextSearchStart: citext!) {
    medicalsubstances: medicalsubstance(
      where: {
        _or: [
          { medicalsubstancename: { _ilike: $textSearch } }
          { medicalsubstancename: { _ilike: $textSearchStart } }
        ]
      }
      limit: 50
    ) {
      medicalsubstanceid
      medicalsubstancename
      therapeuticdrugclass {
        therapeuticdrugclassname
      }
    }

    companies: company(
      where: {
        _or: [
          { company_fullname: { _ilike: $citextSearch } }
          { company_displayname: { _ilike: $citextSearch } }
          { company_fullname: { _ilike: $citextSearchStart } }
          { company_displayname: { _ilike: $citextSearchStart } }
        ]
      }
      limit: 50
    ) {
      company_id
      company_fullname
      company_displayname
    }

    brands: brand(
      where: {
        _or: [
          { brandname: { _ilike: $citextSearch } }
          { brandname: { _ilike: $citextSearchStart } }
        ]
      }
      limit: 50
    ) {
      brandid
      brandname
      logo_id
      company {
        company_id
        company_fullname
        company_displayname
      }
    }

    products: product(
      where: {
        _or: [
          { productname: { _ilike: $textSearch } }
          { productname: { _ilike: $textSearchStart } }
        ]
      }
      limit: 50
    ) {
      productid
      productname
      image_id
      brand {
        brandid
        brandname
      }
      company {
        company_id
        company_fullname
        company_displayname
      }
    }
  }
`;


// Individual queries for detailed searches
export const GET_MEDICAL_SUBSTANCES = gql`
  query GetMedicalSubstances($searchTerm: citext) {
    medicalsubstance(
      where: { medicalsubstancename: { _ilike: $searchTerm } }
      order_by: { medicalsubstancename: asc }
    ) {
      medicalsubstanceid
      medicalsubstancename
      therapeuticdrugclass {
        therapeuticdrugclassid
        therapeuticdrugclassname
      }
      pharmacologydrugclass {
        pharmacologydrugclassid
        pharmacologydrugclassname
      }
      substancenature {
        substancenatureid
        substancenaturename
      }
    }
  }
`

export const GET_COMPANIES = gql`
  query GetCompanies($searchTerm: citext) {
    company(
      where: { company_fullname: { _ilike: $searchTerm } }
      order_by: { company_fullname: asc }
    ) {
      company_id
      company_fullname
      company_displayname
      company_shortname
      company_email
      company_phone
      isactive
    }
  }
`

export const GET_BRANDS = gql`
  query GetBrands($searchTerm: citext) {
    brand(
      where: { brandname: { _ilike: $searchTerm } }
      order_by: { brandname: asc }
    ) {
      brandid
      brandname
      brandtypeid
      companyid
      logo_id
      description
      isactive
      company {
        company_id
        company_fullname
        company_displayname
      }
      genericbrands(order_by: { position: asc }) {
        genericbrandid
        medicalsubstanceid
        medicalsubstance {
          medicalsubstanceid
          medicalsubstancename
        }
      }
    }
  }
`

export const GET_PRODUCTS = gql`
  query GetProducts($searchTerm: citext) {
    product(
      where: { productname: { _ilike: $searchTerm } }
      order_by: { productname: asc }
    ) {
      productid
      productname
      brandid
      companyid
      price
      image_id
      isactive
      brand {
        brandid
        brandname
      }
      company {
        company_id
        company_fullname
      }
      product_substances(order_by: { position: asc }) {
        id
        medicalsubstanceid
        medicalsubstance {
          medicalsubstancename
        }
        medicalsubstancestrength {
          value
          unit
        }
      }
    }
  }
`

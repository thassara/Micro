# Read Me First

The following was discovered as part of building this project:

* The original package name 'com.api-gateway.demo' is invalid and this project uses 'com.api_gateway.demo' instead.

# Getting Started

### Reference Documentation

For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/3.4.4/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.4.4/maven-plugin/build-image.html)
* [Spring Cloud Gateway Access Control [Enterprise]](https://techdocs.broadcom.com/us/en/vmware-tanzu/spring/spring-cloud-gateway-extensions/1-0-0/scg-extensions/access-control.html)
* [Spring Boot DevTools](https://docs.spring.io/spring-boot/3.4.4/reference/using/devtools.html)
* [Spring Security](https://docs.spring.io/spring-boot/3.4.4/reference/web/spring-security.html)

### Guides

The following guides illustrate how to use some features concretely:

* [Securing a Web Application](https://spring.io/guides/gs/securing-web/)
* [Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
* [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)

## VMware Tanzu Spring Enterprise Extensions

You have selected to add [Tanzu Spring](https://www.vmware.com/products/app-platform/tanzu-spring) enterprise extensions
to your project.
In order to use these enterprise extensions you must have
authorized [access to the Spring Enterprise Subscription](https://techdocs.broadcom.com/us/en/vmware-tanzu/spring/tanzu-spring/commercial/spring-tanzu/guide-artifact-repository-administrators.html)
artifacts with an entitlement to Tanzu Spring.
To learn more about what is included with Tanzu Spring entitlement, check
out [enterprise.spring.io](https://enterprise.spring.io/) for more information.

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the
parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.


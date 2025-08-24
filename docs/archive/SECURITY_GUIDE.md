# 🔐 AI-Powered D&D Game - Security Guide

## **Overview**

This guide explains the security configuration required for the AI-Powered D&D Game application, specifically focusing on JWT and Session secrets.

## **Security Secrets Required**

### **JWT_SECRET**
- **Purpose**: Used to sign and verify JSON Web Tokens (JWTs)
- **Usage**: When users log in, the backend creates a JWT containing user information
- **Security**: The secret ensures that only your server can create valid tokens
- **Example**: User authentication, session management, API access control

### **SESSION_SECRET**
- **Purpose**: Used to encrypt session data stored in cookies
- **Usage**: Protects user session information from tampering
- **Security**: Prevents session hijacking and ensures session integrity
- **Example**: User preferences, temporary game state, login status

## **Why These Secrets Are Important**

Without these secrets:
- **JWT tokens could be forged** by attackers
- **User sessions could be hijacked**
- **API endpoints could be accessed without proper authentication**
- **Game state could be manipulated**
- **User data could be compromised**

## **How to Generate Secure Secrets**

### **Option 1: Using Node.js (Recommended)**
```bash
# Generate a random 64-character string for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate another for SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Option 2: Using OpenSSL**
```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate SESSION_SECRET
openssl rand -hex 32
```

### **Option 3: Using Online Generators**
- Visit [randomkeygen.com](https://randomkeygen.com/)
- Choose "WPA Key" or "64 Character Hexadecimal"
- Generate two different keys

## **Example Generated Secrets**

Here are examples of what secure secrets look like:

```env
# JWT_SECRET (64 characters)
JWT_SECRET=c37b7c9caa61dac2f20fa704c21253cee77fe8703572e720b864723d81b55be8

# SESSION_SECRET (64 characters)
SESSION_SECRET=da8822dc73431ea8389cb78299c100c3de625c325d31f86152ef10a38e7630ae
```

## **Security Best Practices**

### **1. Never Use Default Values**
❌ **Wrong:**
```env
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

✅ **Correct:**
```env
JWT_SECRET=c37b7c9caa61dac2f20fa704c21253cee77fe8703572e720b864723d81b55be8
SESSION_SECRET=da8822dc73431ea8389cb78299c100c3de625c325d31f86152ef10a38e7630ae
```

### **2. Environment-Specific Secrets**
- Use different secrets for development and production
- Never share production secrets
- Consider using secrets management services in production

### **3. Secret Rotation**
- Rotate secrets periodically in production
- Plan for secret rotation without service disruption
- Keep a secure backup of current secrets

### **4. Secret Length and Complexity**
- Keep secrets at least 32 characters long
- Use truly random generation (not predictable patterns)
- Avoid using words, phrases, or personal information

## **Updating Your .env File**

1. **Generate new secrets** using one of the methods above
2. **Update your .env file**:
   ```bash
   nano .env
   ```
3. **Replace the placeholder values** with your generated secrets
4. **Restart your services**:
   ```bash
   docker-compose restart
   ```

## **Verifying Security Configuration**

After updating the secrets:

1. **Check service status**:
   ```bash
   docker-compose ps
   ```

2. **Test authentication endpoints**:
   ```bash
   curl http://localhost:5001/health
   ```

3. **Check logs for any security-related errors**:
   ```bash
   docker-compose logs backend
   ```

## **Production Considerations**

### **Secrets Management**
- Store secrets in environment variables or secrets management systems
- Never commit secrets to version control
- Use different secrets across different environments
- Implement secret rotation strategies

### **Monitoring and Alerting**
- Monitor for authentication failures
- Set up alerts for suspicious activity
- Log security events appropriately
- Regular security audits

### **Compliance**
- Ensure secrets meet your organization's security policies
- Consider regulatory requirements (GDPR, HIPAA, etc.)
- Document security procedures
- Train team members on security best practices

## **Troubleshooting Security Issues**

### **Common Problems**

#### **"JWT_SECRET environment variable is required"**
- Check that JWT_SECRET is set in your .env file
- Verify the .env file is in the correct location
- Restart services after updating environment variables

#### **"SESSION_SECRET environment variable is required"**
- Check that SESSION_SECRET is set in your .env file
- Verify the .env file is in the correct location
- Restart services after updating environment variables

#### **Authentication Not Working**
- Verify both secrets are properly set
- Check that secrets are at least 32 characters long
- Ensure services have been restarted
- Check backend logs for specific error messages

### **Getting Help**
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Review backend logs for detailed error messages
- Create an issue on GitHub with specific error details
- Ensure you're not sharing actual secrets in bug reports

---

**Last Updated**: August 2025  
**Version**: 1.1.0

For additional security information, see the [Installation Guide](INSTALLATION.md) and [Troubleshooting Guide](TROUBLESHOOTING.md).

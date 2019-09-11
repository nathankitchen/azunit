<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:ms="urn:schemas-microsoft-com:xslt">

  <xsl:output method="xml" version="1.0" encoding="utf-8" omit-xml-declaration="no" indent="yes" cdata-section-elements="message stacktrace" />

  <xsl:template match="azunit">
    <test-results name="{@name}" total="{count(//test)}" errors="{count(//test[@result='Failed'])}" failures="0" not-run="{count(//test[@result='Ignored'])}" inconclusive="0" ignored="0" skipped="0" invalid="0" date="{ms:format-date(@startTime, '[Y0001]-[M01]-[D01]')}" time="{ms:format-time(@startTime,'[h01]:[m01]:[s01]')}">

        <environment nunit-version="2.6.0.12035" clr-version="2.0.50727.4963" os-version="Microsoft Windows NT 6.1.7600.0" platform="Win32NT" cwd="C:\Program Files\NUnit 2.6\bin" machine-name="CHARLIE-LAPTOP" user="charlie" user-domain="charlie-laptop"/>
        <culture-info current-culture="en-GB" current-uiculture="en-GB"/>
        
        <xsl:apply-templates />

    </test-results>
  </xsl:template>

  <xsl:template match="group">

    <test-suite type="Assembly" name="{@name}" fullname="{@source}" executed="True" result="Failure" success="False" time="{@duration}" asserts="{count(//assertion)}">
      <results>
        <xsl:apply-templates />
      </results>
    </test-suite>
  </xsl:template>

 <xsl:template match="test[@result='Failed']">
    <test-case name="{@name}" description="{@description}" executed="True" result="{@result}" success="False" time="{@duration}" asserts="{count(assertion)}">
      <failure>
        <message>
            <xsl:for-each select="assertion[@result='Failed']">
                <xsl:value-of select="text()" />
                <xsl:text>&#10;</xsl:text>
            </xsl:for-each>
        </message>
        <stacktrace>
            <xsl:for-each select="assertion">
                <xsl:value-of select="text()" />
                <xsl:text>&#10;</xsl:text>
            </xsl:for-each>
        </stacktrace>
      </failure>
    </test-case>
  </xsl:template>
  
   <xsl:template match="test[@result='Passed']">
    <test-case name="{@name}" description="{@description}" executed="True" result="{@result}" success="False" time="{@duration}" asserts="{count(assertion)}">

    </test-case>
  </xsl:template>

  <xsl:template match="coverage">
    <!-- Bury the coverage data -->
  </xsl:template>
  
</xsl:stylesheet>

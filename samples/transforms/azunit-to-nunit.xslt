<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="xml"/>

  <xsl:template match="/">
    Article - <xsl:value-of select="/Article/Title"/>
    Authors: <xsl:apply-templates select="/Article/Authors/Author"/>
  </xsl:template>

  <xsl:template match="Author">
    - <xsl:value-of select="." />
  </xsl:template>

</xsl:stylesheet>

<!--
This file represents the results of running a test suite
-->
<test-results name="C:\Program Files\NUnit 2.6\bin\tests\mock-assembly.dll" total="21" errors="1" failures="1" not-run="7" inconclusive="1" ignored="4" skipped="0" invalid="3" date="2012-02-04" time="11:46:05">
    <environment nunit-version="2.6.0.12035" clr-version="2.0.50727.4963" os-version="Microsoft Windows NT 6.1.7600.0" platform="Win32NT" cwd="C:\Program Files\NUnit 2.6\bin" machine-name="CHARLIE-LAPTOP" user="charlie" user-domain="charlie-laptop"/>
    <culture-info current-culture="en-US" current-uiculture="en-US"/>
    <test-suite type="Assembly" name="C:\Program Files\NUnit 2.6\bin\tests\mock-assembly.dll" executed="True" result="Failure" success="False" time="0.094" asserts="0">
    <results>
        <test-suite type="Namespace" name="NUnit" executed="True" result="Failure" success="False" time="0.078" asserts="0">
            <results>
                <test-suite type="Namespace" name="Tests" executed="True" result="Failure" success="False" time="0.078" asserts="0">
                    <results>
                        <test-suite type="Namespace" name="Assemblies" executed="True" result="Failure" success="False" time="0.031" asserts="0">
                            <results>
                                <test-suite type="TestFixture" name="MockTestFixture" description="Fake Test Fixture" executed="True" result="Failure" success="False" time="0.031" asserts="0">
                                    <categories>
                                        <category name="FixtureCategory"/>
                                    </categories>
                                    <results>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.FailingTest" executed="True" result="Failure" success="False" time="0.016" asserts="0">
                                            <failure>
                                                <message>
                                                    <![CDATA[ Intentional failure ]]>
                                                </message>
                                                <stack-trace>
                                                    <![CDATA[
                                                    at NUnit.Tests.Assemblies.MockTestFixture.FailingTest()
                                                    ]]>
                                                </stack-trace>
                                            </failure>
                                        </test-case>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.InconclusiveTest" executed="True" result="Inconclusive" success="False" time="0.000" asserts="0">
                                            <reason>
                                                <message>
                                                <![CDATA[ No valid data ]]>
                                                </message>
                                            </reason>
                                        </test-case>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.MockTest1" description="Mock Test #1" executed="True" result="Success" success="True" time="0.000" asserts="0"/>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.MockTest2" description="This is a really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really, really long description" executed="True" result="Success" success="True" time="0.000" asserts="0">
                                            <categories>
                                                <category name="MockCategory"/>
                                            </categories>
                                            <properties>
                                                <property name="Severity" value="Critical"/>
                                            </properties>
                                        </test-case>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.MockTest4" executed="False" result="Ignored">
                                            <categories>
                                                <category name="Foo"/>
                                            </categories>
                                            <reason>
                                                <message>
                                                    <![CDATA[ ignoring this test method for now ]]>
                                                </message>
                                            </reason>
                                        </test-case>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.MockTest5" executed="False" result="NotRunnable">
                                            <reason>
                                                <message>
                                                    <![CDATA[ Method is not public ]]>
                                                </message>
                                            </reason>
                                        </test-case>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.NotRunnableTest" executed="False" result="NotRunnable">
                                            <reason>
                                                <message>
                                                    <![CDATA[ No arguments were provided ]]>
                                                </message>
                                            </reason>
                                        </test-case>
                                        <test-case name="NUnit.Tests.Assemblies.MockTestFixture.TestWithException" executed="True" result="Error" success="False" time="0.000" asserts="0">
                                            <failure>
                                                <message>
                                                    <![CDATA[
                                                    System.ApplicationException : Intentional Exception
                                                    ]]>
                                                </message>
                                                <stack-trace>
                                                    <![CDATA[
                                                    at NUnit.Tests.Assemblies.MockTestFixture.MethodThrowsException() at NUnit.Tests.Assemblies.MockTestFixture.TestWithException()
                                                    ]]>
                                                </stack-trace>
                                            </failure>
                                        </test-case>
                                    </test-suite>
                                </results>
                            </test-suite>
                        </results>
                    </test-suite>
                </results>
            </test-suite>
        </results>
    </test-suite>
</test-results>